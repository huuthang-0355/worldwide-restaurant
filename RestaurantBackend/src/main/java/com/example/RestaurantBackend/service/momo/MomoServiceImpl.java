package com.example.RestaurantBackend.service.momo;

import com.example.RestaurantBackend.config.MomoConfig;
import com.example.RestaurantBackend.dto.momo.MomoCreatePaymentRequest;
import com.example.RestaurantBackend.dto.momo.MomoCreatePaymentResponse;
import com.example.RestaurantBackend.dto.momo.MomoQueryRequest;
import com.example.RestaurantBackend.dto.momo.MomoQueryResponse;
import com.example.RestaurantBackend.dto.request.payment.MomoCallbackRequest;
import com.example.RestaurantBackend.dto.request.payment.MomoPaymentRequest;
import com.example.RestaurantBackend.dto.response.payment.BillPreviewResponse;
import com.example.RestaurantBackend.dto.response.payment.MomoCallbackResponse;
import com.example.RestaurantBackend.dto.response.payment.MomoPaymentResponse;
import com.example.RestaurantBackend.dto.response.payment.PaymentStatusResponse;
import com.example.RestaurantBackend.model.Payment;
import com.example.RestaurantBackend.model.Session;
import com.example.RestaurantBackend.model.enums.PaymentMethod;
import com.example.RestaurantBackend.model.enums.PaymentStatus;
import com.example.RestaurantBackend.model.enums.SessionStatus;
import com.example.RestaurantBackend.repo.PaymentRepo;
import com.example.RestaurantBackend.repo.SessionRepo;
import com.example.RestaurantBackend.service.BillService;
import com.example.RestaurantBackend.util.MomoSecurityUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MomoServiceImpl implements MomoService {

    private final MomoConfig momoConfig;
    private final RestClient momoRestClient;
    private final ObjectMapper objectMapper;
    private final SessionRepo sessionRepo;
    private final PaymentRepo paymentRepo;
    private final BillService billService;

    private String generatePaymentReference() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "PAY-" + dateStr + "-";

        int sequence = 1;
        String reference;

        do {
            reference = prefix + String.format("%03d", sequence);
            sequence++;
        } while (paymentRepo.existsByPaymentReference(reference));

        return reference;

    }

    private String buildRawSignature(Map<String, String> params) {

        return params.entrySet().stream()
                .filter(e -> e.getValue() != null)
                .sorted(Map.Entry.comparingByKey()) // sort alphabetically
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining("&"));
    }

    @Transactional
    public MomoPaymentResponse initiatePayment(MomoPaymentRequest request) {
        try {
            // 1. validate session
            Session session = sessionRepo.findById(request.getSessionId())
                    .orElseThrow(() -> new RuntimeException("Session not found"));

            if(session.getStatus() != SessionStatus.ACTIVE &&
                    session.getStatus() != SessionStatus.BILL_REQUESTED) {
                return MomoPaymentResponse.error("Session is not in a valid state for payment. Status: " + session.getStatus());
            }

            // 2. check for existing pending payment
            Payment existingPayment = paymentRepo.findBySessionIdAndStatus(request.getSessionId(),
                    PaymentStatus.PROCESSING).orElse(null);

            if(existingPayment != null) {
                return MomoPaymentResponse.success(
                        existingPayment.getId(),
                        existingPayment.getGatewayRequestId(),
                        existingPayment.getQrCodeUrl(),
                        existingPayment.getDeepLink(),
                        existingPayment.getQrCodeUrl(),
                        existingPayment.getTotalAmount()
                );
            }

            // 3. generate IDs
            String requestId = this.generatePaymentReference();
            String orderId = requestId;
            String orderInfo = "Paymenr for Table " + session.getTable().getTableNumber();
            String extraData = "{\"sessionId\":\"" + request.getSessionId() + "\"}";

            // 4. resolve redirect URL
            String redirectUrl = (request.getReturnUrl() != null &&
                    !request.getReturnUrl().isBlank()) ?
                    request.getReturnUrl() : momoConfig.getRedirectUrl();

            // 5. calculate bill
            BillPreviewResponse billPreview = billService.previewBill(request.getSessionId());
            if(!billPreview.isSuccess())
                return MomoPaymentResponse.error(billPreview.getMessage());

            BigDecimal totalAmount = billPreview.getTotalAmount();
            long amount = totalAmount.longValue();

            // 6. build signature

//            Map<String, String> params = new HashMap<>();
//
//            params.put("accessKey", momoConfig.getAccessKey());
//            params.put("amount", String.valueOf(amount));
//            params.put("extraData", extraData);
//            params.put("ipnUrl", momoConfig.getIpnUrl());
//            params.put("orderId", orderId);
//            params.put("orderInfo", orderInfo);
//            params.put("partnerCode", momoConfig.getPartnerCode());
//            params.put("redirectUrl", redirectUrl);
//            params.put("requestId", requestId);
//            params.put("requestType", momoConfig.getRequestType());


            String rawSignature = "accessKey=" + momoConfig.getAccessKey()
                    + "&amount=" + amount
                    + "&extraData=" + extraData
                    + "&ipnUrl=" + momoConfig.getIpnUrl()
                    + "&orderId=" + orderId
                    + "&orderInfo=" + orderInfo
                    + "&partnerCode=" + momoConfig.getPartnerCode()
                    + "&redirectUrl=" + redirectUrl
                    + "&requestId=" + requestId
                    + "&requestType=" + momoConfig.getRequestType();

            String signature = MomoSecurityUtil.signHmacSHA256(rawSignature, momoConfig.getSecretKey());

            // 7. build momo request
            MomoCreatePaymentRequest momoRequest = MomoCreatePaymentRequest.builder()
                    .partnerCode(momoConfig.getPartnerCode())
                    .partnerName("World-wide Restaurant")
                    .storeId("WorldwideRestaurant")
                    .requestId(requestId)
                    .amount(amount)
                    .orderId(orderId)
                    .orderInfo(orderInfo)
                    .redirectUrl(redirectUrl)
                    .ipnUrl(momoConfig.getIpnUrl())
                    .lang(momoConfig.getLang())
                    .requestType(momoConfig.getRequestType())
                    .autoCapture(momoConfig.isAutoCapture())
                    .extraData(extraData)
                    .signature(signature)
                    .build();

            log.info("Momo create payment request for session: {}", request.getSessionId());

            // 8. call MOMO API
            MomoCreatePaymentResponse momoResponse = momoRestClient.post()
                    .uri(momoConfig.getEndpoint())
                    .body(momoRequest)
                    .retrieve()
                    .body(MomoCreatePaymentResponse.class);

            if(momoResponse == null)
                return MomoPaymentResponse.error("Empty response from Momo");

            log.info("Momo response - resultCode: {}, message: {}",
                    momoResponse.getResultCode(), momoResponse.getMessage());

            if(momoResponse.getResultCode() != 0) {
                log.error("Momo payment initiation failed: {} - {}",
                        momoResponse.getResultCode(), momoResponse.getMessage());


                return MomoPaymentResponse.error("Momo payment failed: " + momoResponse.getMessage());
            }

            // 9. save payment record
            String gatewayResponseJson = objectMapper.writeValueAsString(momoResponse);

            Payment payment = Payment.builder()
                    .session(session)
                    .paymentReference(requestId)
                    .method(PaymentMethod.MOMO)
                    .status(PaymentStatus.PROCESSING)
                    .subtotal(billPreview.getSubtotal())
                    .taxAmount(billPreview.getTaxAmount())
                    .serviceCharge(billPreview.getServiceCharge())
                    .discountAmount(BigDecimal.ZERO)
                    .totalAmount(totalAmount)
                    .gatewayRequestId(requestId)
                    .gatewayResponse(gatewayResponseJson)
                    .qrCodeUrl(momoResponse.getQrCodeUrl())
                    .deepLink(momoResponse.getDeeplink())
                    .build();

            payment = paymentRepo.save(payment);

            // 10. update session status
            session.setStatus(SessionStatus.PAYMENT_PENDING);
            sessionRepo.save(session);

            return MomoPaymentResponse.success(
                    payment.getId(),
                    requestId,
                    momoResponse.getPayUrl(),
                    momoResponse.getDeeplink(),
                    momoResponse.getQrCodeUrl(),
                    totalAmount
            );
        }catch (Exception e) {
            log.error("Error initiating Momo payment for session: {}", request.getSessionId(), e);
            return MomoPaymentResponse.error("Error initiating payment: " + e.getMessage());
        }
    }

    @Transactional
    public MomoCallbackResponse handleCallback(MomoCallbackRequest request) {
        try {
            log.info("Momo IPN callback received: orderId={}, resultCode={}",
                    request.getOrderId(), request.getResultCode());

            // 1. verify signature
            String rawSignature = "accessKey=" + momoConfig.getAccessKey()
                    + "&amount=" + request.getAmount()
                    + "&extraData=" + request.getExtraData()
                    + "&message=" + request.getMessage()
                    + "&orderId=" + request.getOrderId()
                    + "&orderInfo=" + request.getOrderInfo()
                    + "&orderType=" + request.getOrderType()
                    + "&partnerCode=" + request.getPartnerCode()
                    + "&payType=" + request.getPayType()
                    + "&requestId=" + request.getRequestId()
                    + "&responseTime=" + request.getResponseTime()
                    + "&resultCode=" + request.getResultCode()
                    + "&transId=" + request.getTransId();

            if(!MomoSecurityUtil.verifySignature(
                    rawSignature,
                    request.getSignature(),
                    momoConfig.getSecretKey())) {

                log.error("Invalid Momo signature for orderId: {}", request.getOrderId());
                return MomoCallbackResponse.error("Invalid signature");

            }

            // 2. find payment by request id
            Payment payment = paymentRepo.findByGatewayRequestId(request.getRequestId())
                    .orElse(null);

            if (payment == null) {
                log.error("Payment not found for requestId: {}", request.getRequestId());
                return MomoCallbackResponse.error("Payment not found");
            }

            // 3. idempotency check
            if(payment.getStatus() == PaymentStatus.COMPLETED) {
                log.warn("Payment already completed: {}", payment.getId());
                return MomoCallbackResponse.success("Already processed");
            }

            // 4. validate amount
            if(payment.getTotalAmount().longValue() != request.getAmount()) {
                log.error("Amount mismatch - Expected: {}, Got: {}",
                        payment.getTotalAmount(), request.getAmount());

                payment.setStatus(PaymentStatus.FAILED);

                String callbackJson = objectMapper.writeValueAsString(request);
                payment.setGatewayResponse(callbackJson);
                payment.setGatewayCallbackAt(LocalDateTime.now());
                paymentRepo.save(payment);

                return MomoCallbackResponse.error("Amount mismatch");
            }

            // 5. process based on result code
            String callbackJson = objectMapper.writeValueAsString(request);
            payment.setGatewayTransactionId(String.valueOf(request.getTransId()));
            payment.setGatewayResponse(callbackJson);
            payment.setGatewayCallbackAt(LocalDateTime.now());

            if(request.getResultCode() == 0) {
                completePayment(payment);
                log.info("Payment completed successfully: {}", payment.getId());
            }else {
                failPayment(payment);
                log.warn("Payment failed: {} - resultCode: {}, message: {}",
                        payment.getId(), request.getResultCode(), request.getMessage());

            }

            // always return success to Momo (prevent IPN retry spam)

            return MomoCallbackResponse.success("Processed");
        } catch (Exception e) {
            log.error("Error processing Momo callback", e);
            // Return success to Momo even on internal errors
            return MomoCallbackResponse.success("Processed");

        }
    }

    private void completePayment(Payment payment) {
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepo.save(payment);

        // close session
        Session session = payment.getSession();
        session.setStatus(SessionStatus.COMPLETED);
        session.setEndedAt(LocalDateTime.now());
        sessionRepo.save(session);
    }

    private void failPayment(Payment payment) {
        payment.setStatus(PaymentStatus.FAILED);
        paymentRepo.save(payment);

        // revert session status so that guest can retry
        Session session = payment.getSession();
        session.setStatus(SessionStatus.BILL_REQUESTED);
        sessionRepo.save(session);
    }

    @Transactional
    public PaymentStatusResponse queryMomoStatus(UUID paymentId) {
        try {
            Payment payment = paymentRepo.findById(paymentId)
                    .orElse(null);

            if(payment == null) {
                return PaymentStatusResponse.error("Payment not found");
            }

            if(payment.getGatewayRequestId() == null) {
                return PaymentStatusResponse.error("No Momo request ID found for this payment");
            }

            // build query signature
            String rawSignature = "accessKey=" + momoConfig.getAccessKey()
                    + "&orderId=" + payment.getPaymentReference()
                    + "&partnerCode=" + momoConfig.getPartnerCode()
                    + "&requestId=" + payment.getGatewayRequestId();

            String signature = MomoSecurityUtil.signHmacSHA256(rawSignature, momoConfig.getSecretKey());

            // build query request
            MomoQueryRequest queryRequest = MomoQueryRequest.builder()
                    .partnerCode(momoConfig.getPartnerCode())
                    .requestId(payment.getGatewayRequestId())
                    .orderId(payment.getPaymentReference())
                    .lang(momoConfig.getLang())
                    .signature(signature)
                    .build();

            log.info("Momo query request for paymentId: {}", paymentId);

            // call MOMO query API
            MomoQueryResponse queryResponse = momoRestClient.post()
                    .uri(momoConfig.getQueryEndpoint())
                    .body(queryRequest)
                    .retrieve()
                    .body(MomoQueryResponse.class);

            if (queryResponse == null) {
                return PaymentStatusResponse.error("Empty response from Momo query");
            }

            log.info("Momo query response - resultCode: {}, message: {}",
                    queryResponse.getResultCode(), queryResponse.getMessage());

            // update payment based on query result
            if(queryResponse.getResultCode() == 0 && payment.getStatus() != PaymentStatus.COMPLETED) {

                payment.setGatewayTransactionId(String.valueOf(queryResponse.getTransId()));
                completePayment(payment);

            }else if( // 9000: still pending
                    queryResponse.getResultCode() != 0 &&
                            queryResponse.getResultCode() != 9000 &&
                            payment.getStatus() == PaymentStatus.PROCESSING
            ) {
                    failPayment(payment);
            }

            return PaymentStatusResponse.success(payment);
        } catch (Exception e) {

            log.error("Error querying Momo payment status for paymentId: {}", paymentId, e);
            return PaymentStatusResponse.error("Error querying payment status: " + e.getMessage());

        }
    }

    @Override
    @Transactional
    public PaymentStatusResponse checkPaymentStatus(UUID paymentId) {
        Payment payment = paymentRepo.findById(paymentId)
                .orElse(null);

        if(payment == null)
            return PaymentStatusResponse.error("Payment not found");

        return PaymentStatusResponse.success(payment);
    }
}
