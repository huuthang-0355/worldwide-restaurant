import Card from '../ui/Card';
import Button from '../ui/Button';

/**
 * EmptyState - Component shown when no items exist
 */
function EmptyState({ title, message, action }) {
  return (
    <Card className="text-center py-12" padding>
      <p className="text-gray-500 text-lg mb-4">{message || title}</p>
      {action && action}
    </Card>
  );
}

export default EmptyState;
