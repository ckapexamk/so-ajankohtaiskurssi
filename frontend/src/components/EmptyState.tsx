import { EmptyState as Empty } from '@mantine/core';

interface EmptyStateProps {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  children,
  action,
}): React.ReactElement => (
  <Empty p="1em" title={title}>
    {children && <p>{children}</p>}
    {action}
  </Empty>
);

export default EmptyState;