export function formatTimestampSimple(createdAt: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - createdAt.getTime()) / 1000,
  );

  if (diffInSeconds < 60) {
    return "most";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} perce`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} órája`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    createdAt.getDate() === yesterday.getDate() &&
    createdAt.getMonth() === yesterday.getMonth() &&
    createdAt.getFullYear() === yesterday.getFullYear()
  ) {
    return "1 napja";
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 365) {
    if (diffInDays < 7) {
      const daysOfWeek = [
        "vasárnap",
        "hétfő",
        "kedd",
        "szerda",
        "csütörtök",
        "péntek",
        "szombat",
      ];
      return daysOfWeek[createdAt.getDay()] ?? "";
    }
    const month = createdAt.getMonth() + 1;
    const day = createdAt.getDate();
    return `${month}/${day}`;
  }

  const year = createdAt.getFullYear();
  const month = createdAt.getMonth() + 1;
  const day = createdAt.getDate();
  return `${year}/${month}/${day}`;
}

export function formatTimestampExact(createdAt: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - createdAt.getTime()) / 1000,
  );

  if (diffInSeconds < 60) {
    return "most";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} perce`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (
    createdAt.getDate() === now.getDate() &&
    createdAt.getMonth() === now.getMonth() &&
    createdAt.getFullYear() === now.getFullYear()
  ) {
    return `ma ${createdAt.getHours()}:${createdAt.getMinutes()}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    createdAt.getDate() === yesterday.getDate() &&
    createdAt.getMonth() === yesterday.getMonth() &&
    createdAt.getFullYear() === yesterday.getFullYear()
  ) {
    return `tegnap ${createdAt.getHours()}:${createdAt.getMinutes()}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    const daysOfWeek = [
      "vasárnap",
      "hétfő",
      "kedd",
      "szerda",
      "csütörtök",
      "péntek",
      "szombat",
    ];
    const time = `${createdAt.getHours()}:${createdAt.getMinutes()}`;
    return `${daysOfWeek[createdAt.getDay()]} ${time}`;
  }

  const month = createdAt.getMonth() + 1;
  const day = createdAt.getDate();
  if (createdAt.getFullYear() < new Date().getFullYear()) {
    const year = createdAt.getFullYear();
    return `${year}/${month}/${day} ${createdAt.getHours()}:${createdAt.getMinutes()}`;
  }

  return `${month}/${day} ${createdAt.getHours()}:${createdAt.getMinutes()}`;
}
