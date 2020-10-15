(IFS="|"
while read wrong_name name; do
  sed -i "s/|$wrong_name|/|$name|/g" PROPER_GOURCE_HISTORY.txt
done < name_replacements.txt)