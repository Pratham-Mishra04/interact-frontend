import moment from 'moment';

export const getFormattedTime = (time: string | Date) => moment(time).format('YYYY-MM-DDTHH:mm:ss') + '+05:30';
export const getInputFieldFormatTime = (date: Date | Date) => moment(date).format('YYYY-MM-DDTHH:mm');
