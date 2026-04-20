export const formatDate = (date: Date | string | null): string => {
    if (!date) return "Invalid date";

    const DateISO = new Date(date).toISOString();
    return DateISO.split("T").join(" ").split(".")[0];
}