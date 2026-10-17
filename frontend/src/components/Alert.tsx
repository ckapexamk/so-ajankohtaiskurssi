interface AlertProps {
  children: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({ children }): React.ReactElement => (
  <div
    role="alert"
    style={{
      backgroundColor: "#b42318",
      color: "white",
      padding: "1em",
      marginBlock: "0.5em",
    }}
  >
    {children}
  </div>
);

export default Alert;
