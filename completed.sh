#!/bin/bash

# Called by Transmission when a download complete

if [ "$TR_TORRENT_DIR" != "" ] ; then
	echo Renaming $TR_TORRENT_DIR/$TR_TORRENT_NAME >>/Users/dave/trash/000_torrent_complete.log 2>&1
	/usr/local/bin/node `dirname $0`/renmovies.js "$TR_TORRENT_DIR/$TR_TORRENT_NAME" >>/Users/dave/trash/000_torrent_complete.log 2>&1
fi
