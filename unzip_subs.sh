ZIP_DIR=`cat subs.json | json_pp | grep outputPath | sed 's/"//g' | awk 'BEGIN {FS=":"} {print $2}'`

for i in $ZIP_DIR/*.zip
do
	unzip $i -d $ZIP_DIR
	rm $i
done

for i in $ZIP_DIR/*.srt
do
	node renmovies.js $i
done
