function Post({ post_item }) {
    const { username , post_text, post_date } = post_item;
    return(
        <div>
            <p>{post_text}</p>
            <p><label>@{username}</label>- Date: {new Date(post_date).toLocaleString()}</p>
            <hr />
        </div>
    )
}

export default Post