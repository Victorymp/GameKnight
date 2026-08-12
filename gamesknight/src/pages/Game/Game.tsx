
import { Screen, Header } from "../../components/ui/Screen";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useGamesList } from "../../api/api-hooks";
import SideBar from "../../components/ui/SideBar";
import { useNavigate } from "react-router-dom";

export default function Game() {
  const navigate = useNavigate();

  const { data: games, isLoading, error } = useGamesList();

  console.log("games data:", games);

  if (isLoading) return <div>Loading games...</div>;
  if (error) return <div>Failed to load games</div>;

  return (
    <Screen>
      <Header/>
      <div className="flex flex-1">
        <SideBar className="w-56 shrink-0" />
        <main>
          <div className="flex flex-1 gap-2 py-3 px-3">
            {games?.map((game) => (
              <Card>
                <div className="flex flex-col gap-2">
                  <p>{game.gameCode}</p>
                  <Button onClick={() => navigate(`/game/${game.gameCode}`)}>
                    Slect Game
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </Screen>
  );
}