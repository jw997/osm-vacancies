#!/bin/bash

#TODO add ruins, offices disused builing


#   nwr["disused:building"] (37.861175,-122.275975 ,37.875135, -122.2655);
#   nwr["disused:office"] (37.861175,-122.275975 ,37.875135, -122.2655);
#   nwr["disused:amenity"] (37.861175,-122.275975 ,37.875135, -122.2655);
#  nwr["disused:shop"](37.861175,-122.275975 ,37.875135, -122.2655);
#  nwr["abandoned"="yes"](37.861175,-122.275975 ,37.875135, -122.2655);
#  nwr["vacant"="yes"](37.861175,-122.275975 ,37.875135, -122.2655); 


#wget -O ../data/vacantshops.csv 'https://www.overpass-api.de/api/interpreter?data=[out:csv("addr:housenumber", "addr:street","disused:shop","disused:amenity","vacant",name, ::id,::type,::lat, ::lon)];(   nwr["disused:amenity"] (37.861175,-122.275975 ,37.875135, -122.2655);   nwr["disused:shop"](37.861175,-122.275975 ,37.875135, -122.2655); nwr["disused:building"] (37.861175,-122.275975 ,37.875135, -122.2655);  nwr["abandoned"="yes"](37.861175,-122.275975 ,37.875135, -122.2655);   nwr["vacant"="yes"](37.861175,-122.275975 ,37.875135, -122.2655); );(._;>;);out;'


#wget -O ../data/shops.csv 'https://www.overpass-api.de/api/interpreter?data=[out:csv("addr:housenumber", "addr:street","shop","amenity","vacant",name, ::id,::type,::lat, ::lon)];(   nwr["amenity"] (37.861175,-122.275975 ,37.875135, -122.2655);   nwr["leisure"="fitness_centre"] (37.861175,-122.275975 ,37.875135, -122.2655);  nwr["shop"](37.861175,-122.275975 ,37.875135, -122.2655););(._;>;);out;'


wget -O ../data/shops.json 'https://www.overpass-api.de/api/interpreter?data=[out:json];(   nwr["amenity"] (37.861175,-122.275975 ,37.875135, -122.2655);   nwr["shop"](37.861175,-122.275975 ,37.875135, -122.2655); nwr["leisure"] (37.861175,-122.275975 ,37.875135, -122.2655); );(._;>;);out;'

wget -O ../data/vacantshops.json 'https://www.overpass-api.de/api/interpreter?data=[out:json];(   nwr["disused:amenity"] (37.861175,-122.275975 ,37.875135, -122.2655);   nwr["disused:shop"](37.861175,-122.275975 ,37.875135, -122.2655); nwr["disused:building"] (37.861175,-122.275975 ,37.875135, -122.2655);  nwr["abandoned"="yes"](37.861175,-122.275975 ,37.875135, -122.2655);   nwr["vacant"="yes"](37.861175,-122.275975 ,37.875135, -122.2655); );(._;>;);out;'


