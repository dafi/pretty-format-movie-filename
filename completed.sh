#!/bin/bash

# Called by Transmission when a download complete

if [ "$TR_TORRENT_DIR" != "" ] ; then
	node `dirname $0`/renmovies.js $TR_TORRENT_DIR/$TR_TORRENT_NAME	
fi
