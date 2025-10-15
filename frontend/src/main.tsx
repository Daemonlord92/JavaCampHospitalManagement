import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Banana from './App.tsx' //Export Default Import
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter} from "react-router-dom";
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";

const queryClient = new QueryClient();

const theme = createTheme({
    components: {
        MuiContainer: {
            styleOverrides: {
                root: {
                    backgroundColor: "#77ACF1"
                }
            }
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    color: "#F0EBCC"
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: "#3EDBF0"
                }
            }
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#04009A'
                }
            }
        }
    }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme} >
              <CssBaseline/>
              <BrowserRouter>
                <Banana />
              </BrowserRouter>
          </ThemeProvider>
      </QueryClientProvider>
  </StrictMode>,
)
