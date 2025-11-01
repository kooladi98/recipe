import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../app/store';
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    IconButton,
    MenuItem,
    Select,
    Stack,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Tooltip,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { totalTimeMinutes } from '../features/recipes/selectors';
import { toggleFavorite, deleteRecipe } from '../features/recipes/recipesSlice';
import { useNavigate, Link } from 'react-router-dom';

type SortKey = 'asc' | 'desc' | 'nameAsc' | 'nameDesc' | 'fav';

export default function RecipesPage() {
    const recipes = useSelector((s: RootState) => s.recipes.items);
    const dispatch = useDispatch();
    const nav = useNavigate();
    const [filter, setFilter] = useState<string[]>([]);
    const [sort, setSort] = useState<SortKey>('asc');
    const [confirmId, setConfirmId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        let arr = recipes;
        if (filter.length) arr = arr.filter(r => filter.includes(r.difficulty));

        return [...arr].sort((a, b) => {
            switch (sort) {
                case 'asc':
                    return totalTimeMinutes(a) - totalTimeMinutes(b);
                case 'desc':
                    return totalTimeMinutes(b) - totalTimeMinutes(a);
                case 'nameAsc':
                    return a.title.localeCompare(b.title);
                case 'nameDesc':
                    return b.title.localeCompare(a.title);
                case 'fav':
                    return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
                default:
                    return 0;
            }
        });
    }, [recipes, filter, sort]);

    return (
        <Stack gap={2}>
            {/* Header bar with filters */}
            <Stack direction="row" gap={2} alignItems="center">
                <Typography variant="h5" sx={{ flexGrow: 1 }}>
                    Saved Recipes
                </Typography>

                {/* Difficulty Filter */}
                <Select
                    multiple
                    size="small"
                    value={filter}
                    onChange={(e) => {
                        const v = e.target.value;
                        setFilter(Array.isArray(v) ? (v as string[]) : (v ? String(v).split(',') : []));
                    }}
                    displayEmpty
                    renderValue={(selected) => {
                        const arr = selected as string[];
                        if (!arr || arr.length === 0) {
                            return <span style={{ color: '#6b7280' }}>Difficulty</span>;
                        }
                        return arr.join(', ');
                    }}
                >
                    <MenuItem value="Easy">Easy</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Hard">Hard</MenuItem>
                </Select>

                {/* Sort Dropdown */}
                <Select
                    size="small"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    displayEmpty
                    renderValue={(selected) => {
                        if (!selected) {
                            return <span style={{ color: '#6b7280' }}>Sort By</span>;
                        }
                        switch (selected as SortKey) {
                            case 'asc': return 'Sort By Time ↑';
                            case 'desc': return 'Sort By Time ↓';
                            case 'nameAsc': return 'Sort By Name A–Z';
                            case 'nameDesc': return 'Sort By Name Z–A';
                            case 'fav': return 'Sort By Favorites';
                            default: return 'Sort By';
                        }
                    }}
                >
                    <MenuItem value="asc">Time ↑</MenuItem>
                    <MenuItem value="desc">Time ↓</MenuItem>
                    <MenuItem value="nameAsc">Name A–Z</MenuItem>
                    <MenuItem value="nameDesc">Name Z–A</MenuItem>
                    <MenuItem value="fav">Favorites</MenuItem>
                </Select>


                <Chip component={Link} to="/create" clickable color="primary" label="Create Recipe" />
            </Stack>

            {/* Cards grid */}
            <Box
                sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                }}
            >
                {filtered.map((r) => (
                    <Card key={r.id}>
                        <CardActionArea onClick={() => nav(`/cook/${r.id}`)}>
                            <CardContent>
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <Typography sx={{ flexGrow: 1 }} variant="h6">
                                        {r.title}
                                    </Typography>

                                    {/* Edit */}
                                    <Tooltip title="Edit">
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                nav(`/create?id=${r.id}`);
                                            }}
                                            aria-label="edit"
                                            size="small"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>

                                    {/* Delete */}
                                    <Tooltip title="Delete">
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirmId(r.id);
                                            }}
                                            aria-label="delete"
                                            size="small"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>

                                    {/* Favorite */}
                                    <Tooltip title={r.isFavorite ? 'Unfavorite' : 'Favorite'}>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                dispatch(toggleFavorite(r.id));
                                            }}
                                            aria-label="toggle favorite"
                                            size="small"
                                        >
                                            {r.isFavorite ? <StarIcon color="warning" /> : <StarBorderIcon />}
                                        </IconButton>
                                    </Tooltip>
                                </Stack>

                                <Stack direction="row" gap={1} alignItems="center" sx={{ mt: 1 }}>
                                    <Chip size="small" label={r.difficulty} />
                                    <Chip size="small" label={`Total: ${totalTimeMinutes(r)} min`} />
                                </Stack>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                ))}
            </Box>

            {/* Confirm Delete Dialog */}
            <Dialog open={!!confirmId} onClose={() => setConfirmId(null)}>
                <DialogTitle>Delete recipe?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will remove the recipe from your device (localStorage). This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmId(null)}>Cancel</Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => {
                            if (confirmId) dispatch(deleteRecipe(confirmId));
                            setConfirmId(null);
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
