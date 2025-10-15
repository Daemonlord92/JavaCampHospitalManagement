import {AppBar, Container, Toolbar, Typography} from "@mui/material";

const Navbar = () => {
  return(
      <AppBar
      position='sticky'
      sx={{
          backgroundColor: "#77ACF1",
          color: '#F0EBCC'
      }}
      >
          <Container
          maxWidth='md'
          >
            <Toolbar
             sx={{
                 display: 'flex',
                 justifyContent: 'space-evenly',
                 alignContent: 'center'
             }}
            >
                <Typography
                    variant='h6'
                    noWrap
                    component="a"
                    href="/"
                    color='#F0EBCC'
                >
                    Home
                </Typography>
                <Typography
                    variant='h6'
                    noWrap
                    component="a"
                    href="/dashboard"
                    color='#F0EBCC'
                >
                    Dashboard
                </Typography>
                <Typography
                    variant='h6'
                    noWrap
                    component="a"
                    href="/login"
                    color='#F0EBCC'
                >
                    Login
                </Typography>
                <Typography
                    variant='h6'
                    noWrap
                    component="a"
                    href="/"
                    color='#F0EBCC'
                >
                    Logout
                </Typography>
            </Toolbar>
          </Container>
      </AppBar>
  )
}

export default Navbar;