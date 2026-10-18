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
  <section aria-label={title}>
    <h3>{title}</h3>
    {children && <p>{children}</p>}
    {action}
  </section>
);

export default EmptyState;
