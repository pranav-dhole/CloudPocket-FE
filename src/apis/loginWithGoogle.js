export async function loginWithGoogle(idToken) {
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
      credentials: "include",
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
  }
}
