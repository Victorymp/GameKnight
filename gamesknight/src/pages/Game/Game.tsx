
import { Screen, Header } from "../../components/ui/Screen";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useGamesList } from "../../api/api-hooks";
import SideBar from "../../components/ui/SideBar";
import { useNavigate } from "react-router-dom";
import { ImageView } from "../../components/ui/ImageView";

export default function Game() {
  const navigate = useNavigate();

  const { data: games, isLoading, error } = useGamesList();

  if (isLoading) return <div>Loading games...</div>;
  if (error) return <div>Failed to load games</div>;

  return (
    <Screen>
    <Header />
    <div className="flex flex-1">
      <SideBar className="w-56 shrink-0" />

      <main className="flex-1 p-3">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games?.map((game) => (
            <Card key={game.gameCode} className="p-2">
              <div className="flex flex-col gap-2 items-center">
                {game.images?.length > 0 && (
                  <div className="border">
                    <ImageView
                      imageId={game.images[0].id ?? 0}
                      title={game.images[0].title}
                    />
                  </div>
                  )}
                <p>{game.gameCode}</p>
                <Button onClick={() => navigate(`/game/${game.gameCode}`)} className="w-55">
                  Select Game
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