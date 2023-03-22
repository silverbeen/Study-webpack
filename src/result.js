const result = {
  async render() {
    const res = await axios.get("/api/user");

    return res.data
      .map((user) => `<div>${user.id} : ${user.name}</div>`)
      .join("-----");
  },
};

export default result;
