DIR_NAME=`dirname $0`
ZIP_DIR=`cat $DIR_NAME/subs.json | json_pp | grep outputPath | sed 's/"//g' | awk 'BEGIN {FS=":"} {print $2}'`

for i in $ZIP_DIR/*.zip
do
	unzip $i -d $ZIP_DIR
	rm $i
done

for i in $ZIP_DIR/*.srt
do
	node $DIR_NAME/renmovies.js $i
done
