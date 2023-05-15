#!/bin/sh

## Recuperer la date et l'heure pour nommer la photo
date_stamp=$(date +"%F-%H-%M-%S")

## Ou sauvegarder les photos prises par le drone, pour chaque intervention
export DIRECTORY_TO_SAVE="./photos/$3"
mkdir -p $DIRECTORY_TO_SAVE

## Prendre une photo du flux rtsp de la caméra du drone
ffmpeg -ss 2 -rtsp_transport tcp -i "rtsp://148.60.11.229:8554/live" -y -f image2 -q:v 0 -frames:v 1 $DIRECTORY_TO_SAVE/drone_photo_${date_stamp}.png

## Ecrire la date et l'heure sur la photo ainsi que d'autres informations
convert "$DIRECTORY_TO_SAVE/drone_photo_${date_stamp}.png" -gravity Southwest -pointsize 13 -fill white -annotate 0 "${date_stamp}\nlatitude : $1\nlongitude : $2\nIntervention : $3" -gravity Southeast -pointsize 13 -fill white -annotate 0 "Projet Pompiers - Groupe D" "$DIRECTORY_TO_SAVE/drone_photo_${date_stamp}.png"