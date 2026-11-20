[1mdiff --git a/frontend/src/App.jsx b/frontend/src/App.jsx[m
[1mindex 56f4ef4..ae204c6 100644[m
[1m--- a/frontend/src/App.jsx[m
[1m+++ b/frontend/src/App.jsx[m
[36m@@ -2,58 +2,7 @@[m
 import { useState } from "react";[m
 import "./App.css";[m
 [m
[31m-const busRoutes = [[m
[31m-  {[m
[31m-    id: 1,[m
[31m-    name: "BRTC",[m
[31m-    type: "City Bus",[m
[31m-    from: "Mirpur 10",[m
[31m-    to: "Motijheel",[m
[31m-    stops: [[m
[31m-      "Mirpur 10",[m
[31m-      "Kazipara",[m
[31m-      "Shewrapara",[m
[31m-      "Agargaon",[m
[31m-      "Farmgate",[m
[31m-      "Shahbag",[m
[31m-      "Gulistan",[m
[31m-      "Motijheel",[m
[31m-    ],[m
[31m-    color: "#2563eb",[m
[31m-  },[m
[31m-  {[m
[31m-    id: 2,[m
[31m-    name: "Bahon",[m
[31m-    type: "City Bus",[m
[31m-    from: "Uttara",[m
[31m-    to: "Motijheel",[m
[31m-    stops: [[m
[31m-      "Uttara",[m
[31m-      "Airport",[m
[31m-      "Banani",[m
[31m-      "Mohakhali",[m
[31m-      "Farmgate",[m
[31m-      "Shahbag",[m
[31m-      "Gulistan",[m
[31m-      "Motijheel",[m
[31m-    ],[m
[31m-    color: "#16a34a",[m
[31m-  },[m
[31m-  {[m
[31m-    id: 3,[m
[31m-    name: "Trust Transport",[m
[31m-    type: "City Bus",[m
[31m-    from: "Mirpur 10",[m
[31m-    to: "Farmgate",[m
[31m-    stops: [[m
[31m-      "Mirpur 10",[m
[31m-      "Kazipara",[m
[31m-      "Agargaon",[m
[31m-      "Farmgate",[m
[31m-    ],[m
[31m-    color: "#ea580c",[m
[31m-  },[m
[31m-];[m
[32m+[m[32mimport busRoutes from "../../dataset/bus_routes.json";[m
 [m
 const popularRoutes = [[m
   { from: "Mirpur 10", to: "Motijheel" },[m
[36m@@ -67,13 +16,20 @@[m [mfunction App() {[m
   const [to, setTo] = useState("");[m
   const [results, setResults] = useState([]);[m
   const [searched, setSearched] = useState(false);[m
[32m+[m[32m  const [expandedBusId, setExpandedBusId] = useState(null);[m
 [m
[32m+[m[32m  // Search buses[m
   const searchBuses = (start = from, destination = to) => {[m
     if (!start.trim() || !destination.trim()) {[m
       alert("Please enter both starting point and destination.");[m
       return;[m
     }[m
 [m
[32m+[m[32m    if (start.trim().toLowerCase() === destination.trim().toLowerCase()) {[m
[32m+[m[32m      alert("Starting point and destination cannot be the same.");[m
[32m+[m[32m      return;[m
[32m+[m[32m    }[m
[32m+[m
     const matchingBuses = busRoutes.filter((bus) => {[m
       const startIndex = bus.stops.findIndex([m
         (stop) => stop.toLowerCase() === start.trim().toLowerCase()[m
[36m@@ -89,22 +45,31 @@[m [mfunction App() {[m
     setResults(matchingBuses);[m
     setSearched(true);[m
 [m
[31m-    document.getElementById("results")?.scrollIntoView({[m
[31m-      behavior: "smooth",[m
[31m-    });[m
[32m+[m[32m    setTimeout(() => {[m
[32m+[m[32m      document.getElementById("results")?.scrollIntoView({[m
[32m+[m[32m        behavior: "smooth",[m
[32m+[m[32m      });[m
[32m+[m[32m    }, 100);[m
   };[m
 [m
[32m+[m[32m  // Swap locations[m
   const swapLocations = () => {[m
     setFrom(to);[m
     setTo(from);[m
   };[m
 [m
[32m+[m[32m  // Popular route selection[m
   const selectPopularRoute = (start, destination) => {[m
     setFrom(start);[m
     setTo(destination);[m
     searchBuses(start, destination);[m
   };[m
 [m
[32m+[m[32m  // Get unique locations[m
[32m+[m[32m  const uniqueStops = [[m
[32m+[m[32m    ...new Set(busRoutes.flatMap((bus) => bus.stops)),[m
[32m+[m[32m  ];[m
[32m+[m
   return ([m
     <div className="app">[m
 [m
[36m@@ -112,7 +77,9 @@[m [mfunction App() {[m
       <nav className="navbar">[m
         <a href="#home" className="logo">[m
           <span className="logo-icon">🚌</span>[m
[31m-          <span>Dhaka<span className="logo-highlight">Bus</span></span>[m
[32m+[m[32m          <span>[m
[32m+[m[32m            Dhaka<span className="logo-highlight">Bus</span>[m
[32m+[m[32m          </span>[m
         </a>[m
 [m
         <div className="nav-links">[m
[36m@@ -160,6 +127,7 @@[m [mfunction App() {[m
         <div className="hero-visual">[m
           <div className="hero-circle"></div>[m
           <div className="hero-bus">🚌</div>[m
[32m+[m
           <div className="floating-card card-one">[m
             <span>📍</span>[m
             <div>[m
[36m@@ -167,6 +135,7 @@[m [mfunction App() {[m
               <small>Starting point</small>[m
             </div>[m
           </div>[m
[32m+[m
           <div className="floating-card card-two">[m
             <span>🏁</span>[m
             <div>[m
[36m@@ -186,10 +155,13 @@[m [mfunction App() {[m
         </div>[m
 [m
         <div className="search-box">[m
[32m+[m
           <div className="location-field">[m
             <label>FROM</label>[m
[32m+[m
             <div className="input-wrapper">[m
               <span className="location-dot green"></span>[m
[32m+[m
               <input[m
                 list="locations"[m
                 placeholder="Starting location"[m
[36m@@ -209,8 +181,10 @@[m [mfunction App() {[m
 [m
           <div className="location-field">[m
             <label>TO</label>[m
[32m+[m
             <div className="input-wrapper">[m
               <span className="location-dot red"></span>[m
[32m+[m
               <input[m
                 list="locations"[m
                 placeholder="Destination"[m
[36m@@ -221,9 +195,7 @@[m [mfunction App() {[m
           </div>[m
 [m
           <datalist id="locations">[m
[31m-            {Array.from([m
[31m-              new Set(busRoutes.flatMap((bus) => bus.stops))[m
[31m-            ).map((stop) => ([m
[32m+[m[32m            {uniqueStops.map((stop) => ([m
               <option key={stop} value={stop} />[m
             ))}[m
           </datalist>[m
[36m@@ -234,20 +206,21 @@[m [mfunction App() {[m
           >[m
             🔍 Search Buses[m
           </button>[m
[32m+[m
         </div>[m
       </section>[m
 [m
       {/* Search Results */}[m
       {searched && ([m
         <section className="results-section" id="results">[m
[32m+[m
           <div className="results-heading">[m
             <div>[m
               <span className="eyebrow">SEARCH RESULTS</span>[m
               <h2>Available Buses</h2>[m
[31m-              <p>[m
[31m-                {from} → {to}[m
[31m-              </p>[m
[32m+[m[32m              <p>{from} → {to}</p>[m
             </div>[m
[32m+[m
             <span className="result-count">[m
               {results.length} buses found[m
             </span>[m
[36m@@ -255,88 +228,110 @@[m [mfunction App() {[m
 [m
           {results.length > 0 ? ([m
             <div className="bus-grid">[m
[31m-              {results.map((bus) => ([m
[31m-                <div className="bus-card" key={bus.id}>[m
[31m-                  <div className="bus-card-top">[m
[31m-                    <div className="bus-icon">🚌</div>[m
[31m-                    <div>[m
[31m-                      <h3>{bus.name}</h3>[m
[31m-                      <small>{bus.type}</small>[m
[31m-                    </div>[m
[31m-                    <span[m
[31m-                      className="bus-status"[m
[31m-                      style={{ color: bus.color }}[m
[31m-                    >[m
[31m-                      ● Available route[m
[31m-                    </span>[m
[31m-                  </div>[m
 [m
[31m-                  <div className="route-info">[m
[31m-                    <div className="route-point">[m
[31m-                      <span className="location-dot green"></span>[m
[32m+[m[32m              {results.map((bus) => {[m
[32m+[m[32m                const startIndex = bus.stops.findIndex([m
[32m+[m[32m                  (stop) => stop.toLowerCase() === from.trim().toLowerCase()[m
[32m+[m[32m                );[m
[32m+[m
[32m+[m[32m                const endIndex = bus.stops.findIndex([m
[32m+[m[32m                  (stop) => stop.toLowerCase() === to.trim().toLowerCase()[m
[32m+[m[32m                );[m
[32m+[m
[32m+[m[32m                const routeStops = bus.stops.slice([m
[32m+[m[32m                  startIndex,[m
[32m+[m[32m                  endIndex + 1[m
[32m+[m[32m                );[m
[32m+[m
[32m+[m[32m                return ([m
[32m+[m[32m                  <div className="bus-card" key={bus.id}>[m
[32m+[m
[32m+[m[32m                    <div className="bus-card-top">[m
[32m+[m[32m                      <div className="bus-icon">🚌</div>[m
[32m+[m
                       <div>[m
[31m-                        <small>BOARDING POINT</small>[m
[31m-                        <strong>{from}</strong>[m
[32m+[m[32m                        <h3>{bus.name}</h3>[m
[32m+[m[32m                        <small>{bus.type}</small>[m
                       </div>[m
[32m+[m
[32m+[m[32m                      <span[m
[32m+[m[32m                        className="bus-status"[m
[32m+[m[32m                        style={{ color: bus.color }}[m
[32m+[m[32m                      >[m
[32m+[m[32m                        ● Available route[m
[32m+[m[32m                      </span>[m
                     </div>[m
 [m
[31m-                    <div className="route-line">[m
[31m-                      {bus.stops[m
[31m-                        .slice([m
[31m-                          bus.stops.indexOf(from),[m
[31m-                          bus.stops.indexOf(to) + 1[m
[31m-                        )[m
[31m-                        .map((stop, index) => ([m
[31m-                          <span key={index} title={stop}></span>[m
[32m+[m[32m                    <div className="route-info">[m
[32m+[m
[32m+[m[32m                      <div className="route-point">[m
[32m+[m[32m                        <span className="location-dot green"></span>[m
[32m+[m
[32m+[m[32m                        <div>[m
[32m+[m[32m                          <small>BOARDING POINT</small>[m
[32m+[m[32m                          <strong>{from}</strong>[m
[32m+[m[32m                        </div>[m
[32m+[m[32m                      </div>[m
[32m+[m
[32m+[m[32m                      <div className="route-line">[m
[32m+[m[32m                        {routeStops.map((stop, index) => ([m
[32m+[m[32m                          <span[m
[32m+[m[32m                            key={index}[m
[32m+[m[32m                            title={stop}[m
[32m+[m[32m                          ></span>[m
                         ))}[m
[31m-                    </div>[m
[32m+[m[32m                      </div>[m
 [m
[31m-                    <div className="route-point">[m
[31m-                      <span className="location-dot red"></span>[m
[31m-                      <div>[m
[31m-                        <small>DESTINATION</small>[m
[31m-                        <strong>{to}</strong>[m
[32m+[m[32m                      <div className="route-point">[m
[32m+[m[32m                        <span className="location-dot red"></span>[m
[32m+[m
[32m+[m[32m                        <div>[m
[32m+[m[32m                          <small>DESTINATION</small>[m
[32m+[m[32m                          <strong>{to}</strong>[m
[32m+[m[32m                        </div>[m
                       </div>[m
[32m+[m
[32m+[m[32m                    </div>[m
[32m+[m
[32m+[m[32m                    <div className="bus-card-footer">[m
[32m+[m[32m                      <span>[m
[32m+[m[32m                        📍 {routeStops.length} stops[m
[32m+[m[32m                      </span>[m
[32m+[m
[32m+[m[32m                      <button[m
[32m+[m[32m                        onClick={() =>[m
[32m+[m[32m                          alert([m
[32m+[m[32m                            "Bus route: " + routeStops.join(" → ")[m
[32m+[m[32m                          )[m
[32m+[m[32m                        }[m
[32m+[m[32m                      >[m
[32m+[m[32m                        View Route →[m
[32m+[m[32m                      </button>[m
                     </div>[m
[31m-                  </div>[m
 [m
[31m-                  <div className="bus-card-footer">[m
[31m-                    <span>[m
[31m-                      📍 {bus.stops.indexOf(to) -[m
[31m-                        bus.stops.indexOf(from) + 1} stops[m
[31m-                    </span>[m
[31m-                    <button[m
[31m-                      onClick={() =>[m
[31m-                        alert([m
[31m-                          "Bus route: " +[m
[31m-                          bus.stops.slice([m
[31m-                            bus.stops.indexOf(from),[m
[31m-                            bus.stops.indexOf(to) + 1[m
[31m-                          ).join(" → ")[m
[31m-                        )[m
[31m-                      }[m
[31m-                    >[m
[31m-                      View Route →[m
[31m-                    </button>[m
                   </div>[m
[31m-                </div>[m
[31m-              ))}[m
[32m+[m[32m                );[m
[32m+[m[32m              })}[m
[32m+[m
             </div>[m
           ) : ([m
             <div className="no-results">[m
               <div>🔎</div>[m
               <h3>No buses found!</h3>[m
[32m+[m
               <p>[m
                 We couldn't find a direct bus for this route.[m
                 Try another location.[m
               </p>[m
             </div>[m
           )}[m
[32m+[m
         </section>[m
       )}[m
 [m
       {/* Popular Routes */}[m
       <section className="popular-section" id="popular">[m
[32m+[m
         <div className="section-heading">[m
           <span className="eyebrow">EXPLORE DHAKA</span>[m
           <h2>Popular Bus Routes</h2>[m
[36m@@ -344,6 +339,7 @@[m [mfunction App() {[m
         </div>[m
 [m
         <div className="popular-grid">[m
[32m+[m
           {popularRoutes.map((route, index) => ([m
             <button[m
               className="popular-card"[m
[36m@@ -353,22 +349,28 @@[m [mfunction App() {[m
               }[m
             >[m
               <div className="popular-icon">🚌</div>[m
[32m+[m
               <div>[m
                 <strong>{route.from}</strong>[m
                 <span>↓</span>[m
                 <strong>{route.to}</strong>[m
               </div>[m
[32m+[m
               <span className="popular-arrow">→</span>[m
             </button>[m
           ))}[m
[32m+[m
         </div>[m
       </section>[m
 [m
       {/* Map Preview */}[m
       <section className="map-section">[m
[32m+[m
         <div className="map-content">[m
           <span className="eyebrow">EXPLORE THE CITY</span>[m
[32m+[m
           <h2>Navigate Dhaka with ease.</h2>[m
[32m+[m
           <p>[m
             Find bus stops and explore city routes[m
             through our interactive map.[m
[36m@@ -376,37 +378,52 @@[m [mfunction App() {[m
         </div>[m
 [m
         <div className="map-placeholder">[m
[32m+[m
           <div className="map-grid">[m
             <span className="map-road road-one"></span>[m
             <span className="map-road road-two"></span>[m
             <span className="map-road road-three"></span>[m
[32m+[m
             <span className="map-marker marker-one">📍</span>[m
             <span className="map-marker marker-two">📍</span>[m
             <span className="map-marker marker-three">🚌</span>[m
[32m+[m
             <div className="map-label">DHAKA CITY MAP</div>[m
           </div>[m
[32m+[m
           <small>Google Maps integration coming soon</small>[m
[32m+[m
         </div>[m
       </section>[m
 [m
       {/* About */}[m
       <section className="about-section" id="about">[m
[32m+[m
         <span className="eyebrow">ABOUT OUR PROJECT</span>[m
[32m+[m
         <h2>Making public transport easier.</h2>[m
[32m+[m
         <p>[m
           Dhaka Bus Route Finder is designed to help[m
           commuters discover bus routes, identify[m
           bus stops and plan their journeys across Dhaka.[m
         </p>[m
[32m+[m
       </section>[m
 [m
       {/* Footer */}[m
       <footer className="footer">[m
[32m+[m
         <a href="#home" className="logo">[m
           🚌 Dhaka<span className="logo-highlight">Bus</span>[m
         </a>[m
[32m+[m
         <p>Making every journey simpler.</p>[m
[31m-        <span>© 2026 Dhaka Bus Route Finder. All rights reserved.</span>[m
[32m+[m
[32m+[m[32m        <span>[m
[32m+[m[32m          © 2026 Dhaka Bus Route Finder. All rights reserved.[m
[32m+[m[32m        </span>[m
[32m+[m
       </footer>[m
 [m
     </div>[m
