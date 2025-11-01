import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './routes/App'
import RecipesPage from './routes/RecipesPage'
import CreatePage from './routes/CreatePage'
import CookPage from './routes/CookPage'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/recipes', element: <RecipesPage /> },
      { path: '/create', element: <CreatePage /> },
      { path: '/cook/:id', element: <CookPage /> },
      { index: true, element: <RecipesPage /> }, // default to /recipes
      { path: '*', element: <div style={{padding:24}}>Not found</div> }, // catch-all
    ],
  },
])

const theme = createTheme({ palette: { mode: 'light' } })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
)
