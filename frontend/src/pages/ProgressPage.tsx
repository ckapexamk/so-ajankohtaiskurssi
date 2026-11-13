import Progress from "../components/charts"
import { Box, Container, Title } from "@mantine/core";

const ProgressPage: React.FC = (): React.ReactElement => {
  
  return (
    <>
    <Container fluid mt="1em"
        style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Title order={2}>Sessions per week</Title>
        <Progress></Progress>
    </Container>
    </>
  );
};

export default ProgressPage;