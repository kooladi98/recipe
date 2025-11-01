import { useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Container } from '@mui/material'
import MiniPlayer from '../components/MiniPlayer'
import { useDispatch, useSelector } from 'react-redux'
import { tickSecond } from '../features/session/sessionSlice'
import type { RootState } from '../app/store'

export default function App() {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const activeId = useSelector((s: RootState) => s.session.activeRecipeId)

  useEffect(() => {
    const id = setInterval(() => dispatch(tickSecond()), 1000)
    return () => clearInterval(id)
  }, [dispatch])

  const hideMini = activeId && location.pathname === `/cook/${activeId}`

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1 }}
            component={Link}
            to="/recipes"
            color="inherit"
          >
            Upliance Recipes
          </Typography>
          {/* <Typography component={Link} to="/create" color="inherit">
            Create Recipe
          </Typography> */}
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 3, mb: 10 }}>
        <Outlet />
      </Container>

      {!hideMini && <MiniPlayer onClick={() => activeId && navigate(`/cook/${activeId}`)} />}
    </>
  )
}
