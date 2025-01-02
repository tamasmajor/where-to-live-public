## Where to live

### Backend
npm install
mkdir db
GOOGLE_MAPS_API_KEY=<your-key> node src/index.js

### Frontend
e.g. with npm package http-server
cd src
http-server -c 0 -p 7777

### Add a new item for analysis
POST http://localhost:3000/analyses

```
{
    "target": {
      "name": "Target",
        "lat": 47.501746358862036,
        "lon": 19.05379181795826
    },
    "origin": {
      "name": "Origin",
        "lat": 47.50658592518589,
        "lon": 19.13854606458557
    },
    "resolution": 300,
    "radius": 3000
}
```
