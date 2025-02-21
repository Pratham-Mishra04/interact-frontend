import moment from 'moment';

const getDisplayTime = (date: Date, space: boolean = true, wider: boolean = false): string => {
  if (wider) {
    return moment(date).fromNow();
  }

  const fromNow = moment(date).fromNow(true);
  const [quantity, unit] = fromNow.split(' ');
  let formattedQuantity = quantity === 'a' || quantity === 'an' ? '1' : quantity;
  let formattedUnit = '';

  if (unit?.includes('second')) formattedUnit = 'S';
  else if (unit?.includes('minute')) formattedUnit = 'Min';
  else if (unit?.includes('hour')) formattedUnit = 'H';
  else if (unit?.includes('day')) formattedUnit = 'D';
  else if (unit?.includes('week')) formattedUnit = 'W';
  else if (unit?.includes('month')) formattedUnit = 'M';
  else if (unit?.includes('year')) formattedUnit = 'Y';

  return `${formattedQuantity}${space ? ' ' : ''}${formattedUnit}`;
};

export default getDisplayTime;
