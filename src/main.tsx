import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { createHashRouter, RouterProvider } from 'react-router-dom'; 
import App from './routes/App';
import RecipesPage from './routes/RecipesPage';
import CreatePage from './routes/CreatePage';
import CookPage from './routes/CookPage';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <RecipesPage /> },          
      { path: 'recipes', element: <RecipesPage /> },     
      { path: 'create', element: <CreatePage /> },        
      { path: 'cook/:id', element: <CookPage /> },        
      { path: '*', element: <div style={{ padding: 24 }}>Not found</div> },
    ],
  },
]);

const theme = createTheme({ palette: { mode: 'light' } });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
