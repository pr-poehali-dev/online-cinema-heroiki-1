import { useState, useMemo, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { TV_CHANNELS, SCHEDULE, SERIES, MOVIES } from "@/data/content";

type Section = "home" | "schedule" | "movies" | "series" | "channels";

const NAV_ITEMS: { id: Section; label: string; icon: string }[] = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "schedule", label: "Программа", icon: "CalendarDays" },
  { id: "movies", label: "Фильмы", icon: "Film" },
  { id: "series", label: "Мультсериалы", icon: "Tv" },
  { id: "channels", label: "ТВ-каналы", icon: "Radio" },
];

const GENRES = ["Все", "Мультфильм", "Приключения", "Семейное", "Для детей", "Фантастика"];

const DAYS_RU = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
const MONTHS_RU = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];

interface ContentItem {
  id: number;
  title: string;
  poster: string;
  rating: string;
  genre: string;
  tags: string[];
  description: string;
  year?: number;
  years?: string;
  seasons?: number;
  duration?: string;
  episodes?: number;
  channel?: string;
  video?: string | null;
  inCinemas?: string | null;
  issueNumber?: string | null;
}

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function LiveClock() {
  const now = useLiveClock();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const day = DAYS_RU[now.getDay()];
  const date = `${now.getDate()} ${MONTHS_RU[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="hidden lg:flex flex-col items-end leading-none select-none">
      <div className="flex items-baseline gap-1">
        <span className="text-foreground font-black text-xl font-mono tracking-tight">
          {h}<span className="text-primary animate-pulse">:</span>{m}
        </span>
        <span className="text-primary font-mono text-base font-bold tracking-tight">{s}</span>
      </div>
      <div className="text-muted-foreground text-[10px] font-medium mt-0.5 capitalize">
        {day}, {date}
      </div>
    </div>
  );
}

function MobileClock() {
  const now = useLiveClock();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return (
    <div className="lg:hidden flex items-baseline gap-0.5 select-none">
      <span className="text-foreground font-black text-base font-mono">{h}<span className="text-primary">:</span>{m}</span>
      <span className="text-primary font-mono text-xs font-bold">{s}</span>
    </div>
  );
}

function VideoModal({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <p className="text-white/60 text-xs mb-0.5">{item.issueNumber ? `Выпуск №${item.issueNumber}` : item.genre}</p>
            <h3 className="text-white font-bold text-lg leading-tight">{item.title}</h3>
          </div>
          <button
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={onClose}
          >
            <Icon name="X" size={16} className="text-white" />
          </button>
        </div>
        <div className="rounded-2xl overflow-hidden bg-black shadow-2xl">
          <video
            ref={videoRef}
            src={`/${item.video}`}
            controls
            autoPlay
            className="w-full aspect-video"
            style={{ maxHeight: "70vh" }}
          >
            Ваш браузер не поддерживает видео.
          </video>
        </div>
        {item.inCinemas && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-primary font-bold text-sm bg-primary/15 px-4 py-1.5 rounded-full">🎬 {item.inCinemas}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ContentCard({
  item,
  onClick,
  isFavorite,
  onToggleFavorite,
  onWatch,
}: {
  item: ContentItem;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onWatch?: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className="card-hover rounded-xl overflow-hidden bg-card cursor-pointer relative group animate-fade-in"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={item.poster}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <span className="text-xs font-semibold bg-primary/90 text-white px-2 py-0.5 rounded-full">{item.rating}</span>
          {item.issueNumber && (
            <span className="text-[10px] font-bold bg-yellow-500/90 text-black px-2 py-0.5 rounded-full">№{item.issueNumber}</span>
          )}
        </div>

        {/* Favorite */}
        <button
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-primary hover:scale-110"
          onClick={onToggleFavorite}
        >
          <Icon name="Heart" size={15} className={isFavorite ? "fill-primary text-primary" : "text-white"} />
        </button>

        {/* Play button overlay for video */}
        {item.video && onWatch && (
          <button
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onWatch}
          >
            <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
              <Icon name="Play" size={22} className="fill-white text-white ml-1" />
            </div>
          </button>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white font-semibold text-sm leading-tight line-clamp-2">{item.title}</p>
          <p className="text-white/60 text-xs mt-1">
            {"year" in item ? item.year : item.years} · {item.genre}
          </p>
          {item.inCinemas && (
            <p className="text-yellow-400 text-[10px] font-bold mt-0.5">🎬 {item.inCinemas}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Modal({ item, onClose, isFavorite, onToggleFavorite, onWatch }: {
  item: ContentItem;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onWatch?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl max-w-2xl w-full overflow-hidden animate-scale-in shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-72 overflow-hidden">
          <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            onClick={onClose}
          >
            <Icon name="X" size={16} className="text-white" />
          </button>
          <div className="absolute bottom-4 left-6 flex items-center gap-2">
            <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">{item.rating}</span>
            {item.issueNumber && (
              <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">Выпуск №{item.issueNumber}</span>
            )}
          </div>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-1">{item.title}</h2>
          <div className="flex items-center gap-3 text-muted-foreground text-sm mb-4 flex-wrap">
            <span>{"year" in item ? item.year : item.years}</span>
            {"seasons" in item && item.seasons && <span>{item.seasons} сезона</span>}
            {"duration" in item && item.duration && <span>{item.duration}</span>}
            {"episodes" in item && item.episodes && <span>{item.episodes} серий</span>}
            <span>{item.genre}</span>
            {item.inCinemas && <span className="text-yellow-400 font-semibold">🎬 {item.inCinemas}</span>}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {item.tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">{tag}</span>
            ))}
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">{item.description}</p>
          <div className="flex gap-3">
            {item.video && onWatch ? (
              <button
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-colors"
                onClick={onWatch}
              >
                <Icon name="Play" size={18} className="fill-white" />
                Смотреть
              </button>
            ) : (
              <button className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-colors">
                <Icon name="Play" size={18} className="fill-white" />
                Смотреть
              </button>
            )}
            <button
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isFavorite ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
              onClick={onToggleFavorite}
            >
              <Icon name="Heart" size={18} className={isFavorite ? "fill-primary" : ""} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [section, setSection] = useState<Section>("home");
  const [search, setSearch] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(TV_CHANNELS[0].name);
  const [genre, setGenre] = useState("Все");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [videoItem, setVideoItem] = useState<ContentItem | null>(null);

  const allContent: ContentItem[] = [...SERIES, ...MOVIES];

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  };

  const openItem = (item: ContentItem) => {
    setSelectedItem(item);
    setHistory((prev) => {
      const filtered = prev.filter((h) => h !== item.id);
      return [item.id, ...filtered].slice(0, 20);
    });
  };

  const openVideo = (item: ContentItem) => {
    setSelectedItem(null);
    setVideoItem(item);
    setHistory((prev) => {
      const filtered = prev.filter((h) => h !== item.id);
      return [item.id, ...filtered].slice(0, 20);
    });
  };

  const filteredMovies = useMemo(() => {
    return MOVIES.filter((m) => {
      const matchGenre = genre === "Все" || m.genre === genre || m.tags.includes(genre);
      const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase());
      return matchGenre && matchSearch;
    });
  }, [genre, search]);

  const filteredSeries = useMemo(() => {
    return SERIES.filter((s) => {
      const matchGenre = genre === "Все" || s.genre === genre || s.tags.includes(genre);
      const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase());
      return matchGenre && matchSearch;
    });
  }, [genre, search]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    return allContent.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const historyItems = useMemo(() => {
    return history.map((id) => allContent.find((c) => c.id === id)).filter(Boolean) as ContentItem[];
  }, [history]);

  const favoriteItems = useMemo(() => {
    return allContent.filter((c) => favorites.includes(c.id));
  }, [favorites]);

  const heroMovie = MOVIES[0];

  const renderHome = () => (
    <div className="space-y-10 animate-fade-in">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-72 md:h-[420px]">
        <img
          src={heroMovie.poster}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/20" />
        <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-end">
          {heroMovie.issueNumber && (
            <span className="text-xs font-bold bg-yellow-500 text-black px-3 py-1 rounded-full w-fit mb-2">
              Выпуск №{heroMovie.issueNumber}
            </span>
          )}
          <span className="text-xs font-semibold bg-primary text-white px-3 py-1 rounded-full w-fit mb-3">
            {heroMovie.inCinemas ?? `Новинка ${heroMovie.year}`}
          </span>
          <h1 className="text-2xl md:text-4xl font-black text-white mb-2 leading-tight max-w-lg">
            {heroMovie.title}
          </h1>
          <p className="text-white/70 text-sm md:text-base max-w-sm mb-5 line-clamp-2">
            {heroMovie.description}
          </p>
          <div className="flex gap-3">
            {heroMovie.video ? (
              <button
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                onClick={() => openVideo(heroMovie as ContentItem)}
              >
                <Icon name="Play" size={16} className="fill-white" />
                Смотреть
              </button>
            ) : (
              <button
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                onClick={() => openItem(heroMovie as ContentItem)}
              >
                <Icon name="Play" size={16} className="fill-white" />
                Смотреть
              </button>
            )}
            <button
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm backdrop-blur-sm"
              onClick={() => openItem(heroMovie as ContentItem)}
            >
              <Icon name="Info" size={16} />
              Подробнее
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      {historyItems.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Icon name="History" size={18} className="text-primary" />
            История просмотров
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {historyItems.slice(0, 6).map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                onClick={() => openItem(item)}
                isFavorite={favorites.includes(item.id)}
                onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                onWatch={item.video ? (e) => { e.stopPropagation(); openVideo(item); } : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* Favorites */}
      {favoriteItems.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Icon name="Heart" size={18} className="text-primary fill-primary" />
            Избранное
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {favoriteItems.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                onClick={() => openItem(item)}
                isFavorite={true}
                onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                onWatch={item.video ? (e) => { e.stopPropagation(); openVideo(item); } : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* Movies */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Icon name="Film" size={18} className="text-primary" />
          Фильмы
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {MOVIES.map((item) => (
            <ContentCard
              key={item.id}
              item={item as ContentItem}
              onClick={() => openItem(item as ContentItem)}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
              onWatch={item.video ? (e) => { e.stopPropagation(); openVideo(item as ContentItem); } : undefined}
            />
          ))}
        </div>
      </section>

      {/* Series */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Icon name="Tv" size={18} className="text-primary" />
          Мультсериалы
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {SERIES.map((item) => (
            <ContentCard
              key={item.id}
              item={item as ContentItem}
              onClick={() => openItem(item as ContentItem)}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
            />
          ))}
        </div>
      </section>
    </div>
  );

  const renderSchedule = () => {
    const schedule = SCHEDULE[selectedChannel] || [];
    const currentHour = new Date().getHours();
    return (
      <div className="animate-fade-in">
        <h2 className="text-xl font-bold text-foreground mb-6">Программа передач</h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8">
          {TV_CHANNELS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(ch.name)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedChannel === ch.name ? "bg-primary text-white" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <span>{ch.logo}</span>
              <span>{ch.name}</span>
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {schedule.map((item, idx) => {
            const [h] = item.time.split(":").map(Number);
            const isCurrent = item.current || false;
            const isPast = h < currentHour && !isCurrent;
            return (
              <div
                key={idx}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-colors ${
                  isCurrent ? "bg-primary/15 border border-primary/30"
                  : isPast ? "bg-muted/30 opacity-50"
                  : "bg-card hover:bg-secondary/50 cursor-pointer"
                }`}
              >
                <span className={`text-sm font-mono font-bold w-12 ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>{item.time}</span>
                {isCurrent && <div className="live-dot" />}
                <span className={`font-medium flex-1 ${isCurrent || !isPast ? "text-foreground" : "text-muted-foreground"}`}>{item.title}</span>
                {isCurrent && <span className="text-xs font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full">В эфире</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMovies = () => (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Фильмы</h2>
        <span className="text-sm text-muted-foreground">{filteredMovies.length} фильм(ов)</span>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8">
        {GENRES.map((g) => (
          <button key={g} onClick={() => setGenre(g)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${genre === g ? "bg-primary text-white" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
            {g}
          </button>
        ))}
      </div>
      {filteredMovies.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Icon name="Film" size={40} className="mx-auto mb-3 opacity-30" />
          <p>Ничего не найдено</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMovies.map((item) => (
            <ContentCard
              key={item.id}
              item={item as ContentItem}
              onClick={() => openItem(item as ContentItem)}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
              onWatch={item.video ? (e) => { e.stopPropagation(); openVideo(item as ContentItem); } : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderSeries = () => (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Мультсериалы</h2>
        <span className="text-sm text-muted-foreground">{filteredSeries.length} сериал(ов)</span>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8">
        {GENRES.map((g) => (
          <button key={g} onClick={() => setGenre(g)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${genre === g ? "bg-primary text-white" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
            {g}
          </button>
        ))}
      </div>
      {filteredSeries.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Icon name="Tv" size={40} className="mx-auto mb-3 opacity-30" />
          <p>Ничего не найдено</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredSeries.map((item) => (
            <ContentCard
              key={item.id}
              item={item as ContentItem}
              onClick={() => openItem(item as ContentItem)}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderChannels = () => (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-foreground mb-6">ТВ-каналы</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {TV_CHANNELS.map((ch) => {
          const schedule = SCHEDULE[ch.name] || [];
          const current = schedule.find((s) => s.current);
          const upcoming = schedule.filter((s) => !s.current).slice(0, 2);
          return (
            <div
              key={ch.id}
              className="card-hover bg-card rounded-xl p-5 cursor-pointer border border-border hover:border-primary/30 transition-colors"
              onClick={() => { setSelectedChannel(ch.name); setSection("schedule"); }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: ch.color + "44" }}>
                  {ch.logo}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{ch.name}</h3>
                  <p className="text-xs text-muted-foreground">{ch.desc}</p>
                </div>
              </div>
              {current && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="live-dot" />
                    <span className="text-xs text-primary font-semibold">Сейчас в эфире</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{current.title}</p>
                  <p className="text-xs text-muted-foreground">{current.time}</p>
                </div>
              )}
              <div className="border-t border-border pt-3 space-y-1">
                {upcoming.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground w-10 font-mono">{s.time}</span>
                    <span className="text-muted-foreground truncate">{s.title}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-xs text-primary font-medium flex items-center justify-center gap-1 hover:underline">
                Вся программа
                <Icon name="ChevronRight" size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Icon name="Play" size={16} className="fill-white text-white ml-0.5" />
            </div>
            <span className="text-lg font-black text-foreground tracking-tight">Поехали ТВ</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  section === item.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon name={item.icon} size={15} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Live Clock */}
            <LiveClock />
            <MobileClock />

            <button
              className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              onClick={() => setShowSearch((v) => !v)}
            >
              <Icon name="Search" size={16} className="text-muted-foreground" />
            </button>
            <button
              className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              onClick={() => setSection("home")}
            >
              <Icon name="Heart" size={16} className={favorites.length > 0 ? "fill-primary text-primary" : "text-muted-foreground"} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="border-t border-border px-4 py-3 animate-fade-in">
            <div className="max-w-7xl mx-auto relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск фильмов и сериалов..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {search && (
                <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}>
                  <Icon name="X" size={14} className="text-muted-foreground" />
                </button>
              )}
            </div>
            {search && searchResults.length > 0 && (
              <div className="max-w-7xl mx-auto mt-2 bg-popover border border-border rounded-xl overflow-hidden shadow-2xl">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                    onClick={() => { openItem(item); setShowSearch(false); setSearch(""); }}
                  >
                    <img src={item.poster} alt="" className="w-10 h-14 object-cover rounded-md flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.genre} · {item.rating}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {search && searchResults.length === 0 && (
              <div className="max-w-7xl mx-auto mt-2 bg-popover border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground">
                Ничего не найдено по запросу «{search}»
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {section === "home" && renderHome()}
        {section === "schedule" && renderSchedule()}
        {section === "movies" && renderMovies()}
        {section === "series" && renderSeries()}
        {section === "channels" && renderChannels()}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all ${section === item.id ? "text-primary" : "text-muted-foreground"}`}
            >
              <Icon name={item.icon} size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Info Modal */}
      {selectedItem && (
        <Modal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          isFavorite={favorites.includes(selectedItem.id)}
          onToggleFavorite={() => toggleFavorite(selectedItem.id)}
          onWatch={selectedItem.video ? () => openVideo(selectedItem) : undefined}
        />
      )}

      {/* Video Modal */}
      {videoItem && (
        <VideoModal item={videoItem} onClose={() => setVideoItem(null)} />
      )}
    </div>
  );
}
