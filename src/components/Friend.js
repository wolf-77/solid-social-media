function Friend({ url, unfollow }) {
    return(
        <li>
            <label>{url}</label><button className="btn" onClick={() => {
                unfollow(url);
            }}>Unfollow</button>
        </li>
    )
}

export default Friend;