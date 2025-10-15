import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Typography,
} from "@mui/material";

const LandingPage = () => {
  return (
    <Container
      sx={{
        height: "100vh",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
          padding: "3rem",
          margin: "0 auto",
        }}
      >
        <Typography variant="h1" component="h1">
          Welcome to EVA Hospital
        </Typography>
        <Typography component="p">Your health is our priority.</Typography>
        <Container>
          <Typography variant="h4" component="a" href="/login">
            Login
          </Typography>{" "}
          |{" "}
          <Typography variant="h4" component="a" href="/register">
            Register
          </Typography>
        </Container>
      </Container>
      <Container
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
          gap: "1rem",
        }}
      >
        <Card className="card">
          <CardHeader
            title={
              <Typography variant="h3" component="h3">
                Healthcare as a Service
              </Typography>
            }
          ></CardHeader>
          <CardContent>
            <Typography component="p">
              We provide top-notch healthcare services tailored to your needs.
            </Typography>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader
            title={
              <Typography variant="h3" component="h3">
                24/7 Support
              </Typography>
            }
          ></CardHeader>
          <CardContent>
            <Typography component="p">
              Our medical team is available around the clock to assist you.
            </Typography>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader
            title={
              <Typography variant="h3" component="h3">
                Advanced Technology
              </Typography>
            }
          ></CardHeader>
          <CardContent>
            <Typography component="p">
              We utilize the latest medical technology to ensure the best care.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Container>
  );
};

export default LandingPage;
