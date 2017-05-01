#!/bin/bash

# Called by Transmission when a download complete

if [ "$TR_TORRENT_DIR" != "" ] ; then
	LOG_FILE="$TR_TORRENT_DIR/.torrent_fetch/torrents/torrent_complete.log"
	mkdir -p `dirname $LOG_FILE`

	echo Renaming $TR_TORRENT_DIR/$TR_TORRENT_NAME >>$LOG_FILE 2>&1
	/usr/local/bin/node `dirname $0`/renmovies.js "$TR_TORRENT_DIR/$TR_TORRENT_NAME" >>$LOG_FILE 2>&1
	if [ -d "$TR_TORRENT_DIR/$TR_TORRENT_NAME" ]
	then
		found=`find "$TR_TORRENT_DIR/$TR_TORRENT_NAME" -maxdepth 1 -type f -name "*.mp4" -o -name "*.avi" -o -name "*.mkv"`
		if [ -n "$found" ]
		then
			mv "$found" "$TR_TORRENT_DIR"
			osascript -e "tell application \"Finder\" to delete POSIX file \"$TR_TORRENT_DIR/$TR_TORRENT_NAME\"" &>/dev/null
		fi		
	fi
fi
