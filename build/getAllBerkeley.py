import overpass
import geojson

api = overpass.API(timeout=100)


# api.get already returns a FeatureCollection, a GeoJSON type
res = api.get("""
(
   area["gnis:feature_id"="2409837"]->.searchArea;
  
 nwr["tourism"="hotel"](area.searchArea);
 nwr["tourism"="motel"](area.searchArea);
  nwr["amenity"] (area.searchArea);
    nwr["craft"] (area.searchArea);
  nwr["shop"]      (area.searchArea);
    nwr["office"]      (area.searchArea);
  nwr["leisure"] (area.searchArea); 
    nwr["healthcare"] (area.searchArea); 
    
  nwr["disused:amenity"] (area.searchArea);
  nwr["disused:shop"] (area.searchArea);
    nwr["disused:leisure"] (area.searchArea);
  nwr["disused:building"] (area.searchArea);
    nwr["disused:craft"] (area.searchArea);

    nwr["building"="industrial"]["disused"="yes"](area.searchArea);
 nwr["building"]["disused"="yes"](area.searchArea);
    nwr["disused:office"] (area.searchArea);
        nwr["disused:healthcare"] (area.searchArea);
  
  node["vacant"="yes"] (area.searchArea);
  nwr["abandoned"="yes"] (area.searchArea);
  nwr["landuse"] (area.searchArea);
);
(._;>;);
""")

# if you want a str, then use dumps function
#geojson_str = geojson.dumps(res)

# dump as file, if you want to save it in file
with open("../data/all.osm.geojson",mode="w") as f:
  geojson.dump(res,f)

