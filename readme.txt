City report says Downtown vacancy rate by sq foot is about 10%

Downtown 9.9% 15.7% 11.9% 10.8% 10.9%

overpass query for vacant stores
{{geocodeArea:Berkeley}}->.searchArea;
(
 
    nwr["disused:amenity"](area.searchArea);
    nwr["disused:shop"](area.searchArea);
    nwr["abandoned"="yes"](area.searchArea);
 
  
);
/*added by auto repair*/
(._;>;);
/*end of auto repair*/
out;


Businesses can be enters as shop, office, or amenity.
Some other amenities are not busineses i.e. bicycle_parking, bench, atm, 

Let's try manually skipping certain amenities
atm
bench
bicycle_parking
bicycle_rental ?
car_sharing ?
clock
drinking_water
fountain
motorcycle_parking
parking
parking_entrance
post_box
public_bookcase
recycling
taxi
telephone
toilets
vending_machine
waste_basket

Have 3 filter checkboxes

shop
shop like amenities
non-shop like amenties


Algorithms for isShop, isVacant, isLand

isShop
has lat, long, address

shop
amenity && shoplikeAmenity
leisure theatre
sauna / gym?

isVacant
disused:shop
disused:amenity && shoplikeAmenity
proposed:shop
proposed:amenity 
abandoned:building
demolished:building
abandoned = yes
vacant = yes
brownfield
greenfield


isLand
no building, brownfield, greenfield

combine all exports into one overpass query

wget -O ../data/osm.json 'https://www.overpass-api.de/api/interpreter?data=[out:json];(   nwr["amenity"] (37.861175,-122.275975 ,37.875135, -122.27655);   nwr["shop"](37.861175,-122.275975 ,37.875135, -122.2655); nwr["leisure"] (37.861175,-122.275975 ,37.875135, -122.2655); (   nwr["disused:amenity"] (37.861175,-122.275975 ,37.875135, -122.2655);   nwr["disused:shop"](37.861175,-122.275975 ,37.875135, -122.2655); nwr["disused:building"] (37.861175,-122.275975 ,37.875135, -122.2655);  nwr["abandoned"="yes"](37.861175,-122.275975 ,37.875135, -122.2655);   nwr["vacant"="yes"](37.861175,-122.275975 ,37.875135, -122.2655); );(._;>;);out;'






