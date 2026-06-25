export function getIdempotencyKey(resource, id) {
    const storageKey = `${resource}:${id}`;

    let key = sessionStorage.getItem(storageKey);

    if (!key) {
        key = crypto.randomUUID();
        sessionStorage.setItem(storageKey, key);
    }

    return key;
}

export function clearIdempotencyKey(resource, id) {
    sessionStorage.removeItem(`${resource}:${id}`);
}