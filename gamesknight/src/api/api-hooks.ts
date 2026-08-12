import { useQuery } from '@tanstack/react-query';
import { getAllGames } from './api-controller';
import { type GameData } from '../models/model';

export const useGamesList = () => {
  return useQuery<GameData[]>({
    queryKey: ['games'],
    queryFn: getAllGames
  });
};