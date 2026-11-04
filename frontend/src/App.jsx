
import { useState } from "react";
import "./App.css";

const busRoutes = [
  {
    id: 1,
    name: "BRTC",
    type: "City Bus",
    from: "Mirpur 10",
    to: "Motijheel",
    stops: [
      "Mirpur 10",
      "Kazipara",
      "Shewrapara",
      "Agargaon",
      "Farmgate",
      "Shahbag",
      "Gulistan",
      "Motijheel",
    ],
    color: "#2563eb",
  },
  {
    id: 2,
    name: "Bahon",
    type: "City Bus",
    from: "Uttara",
    to: "Motijheel",
    stops: [
      "Uttara",
      "Airport",
      "Banani",
      "Mohakhali",
      "Farmgate",
      "Shahbag",
      "Gulistan",
      "Motijheel",
    ],
    color: "#16a34a",
  },
  {
    id: 3,
    name: "Trust Transport",
    type: "City Bus",
    from: "Mirpur 10",
    to: "Farmgate",
    stops: [
      "Mirpur 10",
      "Kazipara",
      "Agargaon",
      "Farmgate",
    ],
    color: "#ea580c",
  },
];

const popularRoutes = [
  { from: "Mirpur 10", to: "Motijheel" },
  { from: "Uttara", to: "Farmgate" },
  { from: "Dhanmondi", to: "Gulistan" },
  { from: "Mohakhali", to: "Shahbag" },
];

function App() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const searchBuses = (start = from, destination = to) => {
    if (!start.trim() || !destination.trim()) {
      alert("Please enter both starting point and destination.");
      return;
    }

    const matchingBuses = busRoutes.filter((bus) => {
      const startIndex = bus.stops.findIndex(
        (stop) => stop.toLowerCase() === start.trim().toLowerCase()
      );

      const endIndex = bus.stops.findIndex(
        (stop) => stop.toLowerCase() === destination.trim().toLowerCase()
      );

      return startIndex !== -1 && endIndex > startIndex;
    });

    setResults(matchingBuses);
    setSearched(true);

    document.getElementById("results")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const swapLocations = () => {
    setFrom(to);
    setTo(from);
  };

  const selectPopularRoute = (start, destination) => {
    setFrom(start);
    setTo(destination);
    searchBuses(start, destination);
  };

  return (
    <div className="app">

      {/* Navbar */}
      <nav className="navbar">
        <a href="#home" className="logo">
          <span className="logo-icon">🚌</span>
          <span>Dhaka<span className="logo-highlight">Bus</span></span>
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#search">Find Routes</a>
          <a href="#popular">Popular Routes</a>
          <a href="#about">About</a>
        </div>

        <a href="#search" className="nav-button">
          Find a Bus
        </a>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-tag">
            YOUR SMART CITY BUS GUIDE
          </div>

          <h1>
            Explore Dhaka.
            <br />
            <span>Find Your Bus.</span>
          </h1>

          <p>
            Discover bus routes across Dhaka city.
            Find the right bus, explore stops and
            make your daily journey easier.
          </p>

          <a href="#search" className="hero-button">
            Find Your Route <span>→</span>
          </a>

          <div className="hero-features">
            <span>✓ Easy route search</span>
            <span>✓ Bus information</span>
            <span>✓ City navigation</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-circle"></div>
          <div className="hero-bus">🚌</div>
          <div className="floating-card card-one">
            <span>📍</span>
            <div>
              <strong>Mirpur 10</strong>
              <small>Starting point</small>
            </div>
          </div>
          <div className="floating-card card-two">
            <span>🏁</span>
            <div>
              <strong>Motijheel</strong>
              <small>Destination</small>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section" id="search">
        <div className="section-heading">
          <span className="eyebrow">PLAN YOUR JOURNEY</span>
          <h2>Where do you want to go?</h2>
          <p>Enter your starting point and destination.</p>
        </div>

        <div className="search-box">
          <div className="location-field">
            <label>FROM</label>
            <div className="input-wrapper">
              <span className="location-dot green"></span>
              <input
                list="locations"
                placeholder="Starting location"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
          </div>

          <button
            className="swap-button"
            onClick={swapLocations}
            title="Swap locations"
          >
            ⇄
          </button>

          <div className="location-field">
            <label>TO</label>
            <div className="input-wrapper">
              <span className="location-dot red"></span>
              <input
                list="locations"
                placeholder="Destination"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>

          <datalist id="locations">
            {Array.from(
              new Set(busRoutes.flatMap((bus) => bus.stops))
            ).map((stop) => (
              <option key={stop} value={stop} />
            ))}
          </datalist>

          <button
            className="search-button"
            onClick={() => searchBuses()}
          >
            🔍 Search Buses
          </button>
        </div>
      </section>

      {/* Search Results */}
      {searched && (
        <section className="results-section" id="results">
          <div className="results-heading">
            <div>
              <span className="eyebrow">SEARCH RESULTS</span>
              <h2>Available Buses</h2>
              <p>
                {from} → {to}
              </p>
            </div>
            <span className="result-count">
              {results.length} buses found
            </span>
          </div>

          {results.length > 0 ? (
            <div className="bus-grid">
              {results.map((bus) => (
                <div className="bus-card" key={bus.id}>
                  <div className="bus-card-top">
                    <div className="bus-icon">🚌</div>
                    <div>
                      <h3>{bus.name}</h3>
                      <small>{bus.type}</small>
                    </div>
                    <span
                      className="bus-status"
                      style={{ color: bus.color }}
                    >
                      ● Available route
                    </span>
                  </div>

                  <div className="route-info">
                    <div className="route-point">
                      <span className="location-dot green"></span>
                      <div>
                        <small>BOARDING POINT</small>
                        <strong>{from}</strong>
                      </div>
                    </div>

                    <div className="route-line">
                      {bus.stops
                        .slice(
                          bus.stops.indexOf(from),
                          bus.stops.indexOf(to) + 1
                        )
                        .map((stop, index) => (
                          <span key={index} title={stop}></span>
                        ))}
                    </div>

                    <div className="route-point">
                      <span className="location-dot red"></span>
                      <div>
                        <small>DESTINATION</small>
                        <strong>{to}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bus-card-footer">
                    <span>
                      📍 {bus.stops.indexOf(to) -
                        bus.stops.indexOf(from) + 1} stops
                    </span>
                    <button
                      onClick={() =>
                        alert(
                          "Bus route: " +
                          bus.stops.slice(
                            bus.stops.indexOf(from),
                            bus.stops.indexOf(to) + 1
                          ).join(" → ")
                        )
                      }
                    >
                      View Route →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div>🔎</div>
              <h3>No buses found!</h3>
              <p>
                We couldn't find a direct bus for this route.
                Try another location.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Popular Routes */}
      <section className="popular-section" id="popular">
        <div className="section-heading">
          <span className="eyebrow">EXPLORE DHAKA</span>
          <h2>Popular Bus Routes</h2>
          <p>Quickly search some popular city journeys.</p>
        </div>

        <div className="popular-grid">
          {popularRoutes.map((route, index) => (
            <button
              className="popular-card"
              key={index}
              onClick={() =>
                selectPopularRoute(route.from, route.to)
              }
            >
              <div className="popular-icon">🚌</div>
              <div>
                <strong>{route.from}</strong>
                <span>↓</span>
                <strong>{route.to}</strong>
              </div>
              <span className="popular-arrow">→</span>
            </button>
          ))}
        </div>
      </section>

      {/* Map Preview */}
      <section className="map-section">
        <div className="map-content">
          <span className="eyebrow">EXPLORE THE CITY</span>
          <h2>Navigate Dhaka with ease.</h2>
          <p>
            Find bus stops and explore city routes
            through our interactive map.
          </p>
        </div>

        <div className="map-placeholder">
          <div className="map-grid">
            <span className="map-road road-one"></span>
            <span className="map-road road-two"></span>
            <span className="map-road road-three"></span>
            <span className="map-marker marker-one">📍</span>
            <span className="map-marker marker-two">📍</span>
            <span className="map-marker marker-three">🚌</span>
            <div className="map-label">DHAKA CITY MAP</div>
          </div>
          <small>Google Maps integration coming soon</small>
        </div>
      </section>

      {/* About */}
      <section className="about-section" id="about">
        <span className="eyebrow">ABOUT OUR PROJECT</span>
        <h2>Making public transport easier.</h2>
        <p>
          Dhaka Bus Route Finder is designed to help
          commuters discover bus routes, identify
          bus stops and plan their journeys across Dhaka.
        </p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <a href="#home" className="logo">
          🚌 Dhaka<span className="logo-highlight">Bus</span>
        </a>
        <p>Making every journey simpler.</p>
        <span>© 2026 Dhaka Bus Route Finder. All rights reserved.</span>
      </footer>

    </div>
  );
}

export default App;
