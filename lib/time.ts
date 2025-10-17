export function getIsoTimestr(): string {
  return new Date().toISOString()
}

export const getTimestamp = () => {
  const time = Date.parse(new Date().toUTCString())

  return time / 1000
}

export const getMillisecond = () => {
  const time = new Date().getTime()

  return time
}

export const getOneYearLaterTimestr = () => {
  const currentDate = new Date()
  const oneYearLater = new Date(currentDate)
  oneYearLater.setFullYear(currentDate.getFullYear() + 1)

  return oneYearLater.toISOString()
}
