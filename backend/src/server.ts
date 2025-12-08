import express from 'express';
import authRoutes from './routes/auth';
import voteRoutes from './routes/vote';

const app = express();

app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', voteRoutes);

app.get('/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
