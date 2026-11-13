import Progress from "../components/charts"
import { Container } from "@mantine/core";

const ProgressPage: React.FC = (): React.ReactElement => {
  
  return (
    <>
    <Container fluid mt="1em" style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Progress></Progress>
    </Container>
    </>
  );
};

export default ProgressPage;