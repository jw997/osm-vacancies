import overpass
import geojson

api = overpass.API()

# api.get already returns a FeatureCollection, a GeoJSON type
res = api.get("""
(
nwr["amenity"]    (37.861175,-122.275975 ,37.875135, -122.2655);
nwr["shop"]       (37.861175,-122.275975 ,37.875135, -122.2655);
nwr["leisure"]    (37.861175,-122.275975 ,37.875135, -122.2655);
nwr["disused:amenity"] (37.861175,-122.275975 ,37.875135, -122.2655);
nwr["disused:shop"]    (37.861175,-122.275975 ,37.875135, -122.2655);
nwr["disused:building"](37.861175,-122.275975 ,37.875135, -122.2655);
nwr["abandoned"="yes"] (37.861175,-122.275975 ,37.875135, -122.2655);
nwr["vacant"="yes"]    (37.861175,-122.275975 ,37.875135, -122.2655); 
);
(._;>;);
""")

# if you want a str, then use dumps function
#geojson_str = geojson.dumps(res)

# dump as file, if you want to save it in file
with open("../data/osm.geojson",mode="w") as f:
  geojson.dump(res,f)
  
  
#    area[name="Granollers"][admin_level=8];
#    // query part for: “highway=*”
#    (way["highway"](area);
#      relation["highway"](area);
#    );
#    // recurse down to get the nodes, required for the geometry
#    (._;>;);

