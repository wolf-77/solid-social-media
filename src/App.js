import { useEffect, useState } from "react";
import { 
  LoginButton,
  useSession,
  LogoutButton,
} from "@inrupt/solid-ui-react";

import {
  createThing,
  getSolidDataset,
  getThing,
  setThing,
  setStringNoLocale,
  saveSolidDatasetAt,
  getStringNoLocale,
  removeStringNoLocale,
  addStringNoLocale,
  addDatetime,
  addUrl,
  getUrl,
  getDatetime,
  getThingAll,
  getUrlAll,
  removeUrl
} from "@inrupt/solid-client";

import Post from "./components/Post.js";
import Friend from "./components/Friend.js";

// Import logo
import logo from "./logo.png";

// Name of app
const authOptions = {
  clientName: "Solid App",
};

function App() {

  const { session } = useSession();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [data, setData] = useState([]);
  const [newfriend, setNewfriend] = useState("");
  const [inlist, setInlist] = useState(Boolean);
  const [friendList, setFriendList] = useState([]);

  // ====================================
  // Get username from pod
  // ====================================
  useEffect(() => {
    (async() => {
      if(session.info.isLoggedIn){
        const profileDataset = await getSolidDataset(session.info.webId, {
          fetch: session.fetch
        });
  
        // Define the URL of the `card#me` file
        const cardUrl = session.info.webId
  
        // Get the Thing from the card
        let profileCard = getThing(profileDataset, cardUrl);
  
        // If the Thing isn't in the fetched dataset, create a new empty Thing
        if (!profileCard) {
          profileCard = createThing({ url: cardUrl });
        }

        // Remove the existing name from the Thing
        let updatedCard = removeStringNoLocale(profileCard, "http://xmlns.com/foaf/0.1/name");
        
        // Add a name to the Thing -> pod_name
        updatedCard = setStringNoLocale(profileCard, "http://xmlns.com/foaf/0.1/name", cardUrl.split('/')[3]);
  
        // Write the updated Thing back to the SolidDataset
        const updatedDataset = setThing(profileDataset, updatedCard);
  
        // Save the updated SolidDataset back to the Pod
        await saveSolidDatasetAt(cardUrl, updatedDataset, { fetch: session.fetch });

        const name = getStringNoLocale(updatedCard, "http://xmlns.com/foaf/0.1/name");
        setName(name);

        await showFriends();
        await getData();
        await getDataFriend();
      }
    })();
  }, [session.info.isLoggedIn]);

  // ====================================
  // Save/Write new post to pod
  // ====================================
  const saveTextPost = async () => {
    if(session.info.isLoggedIn){
      const postDataset = await getSolidDataset(session.info.webId, {
        fetch: session.fetch
      });

      let postItem = createThing();
      postItem = addUrl(postItem, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://schema.org/BlogPosting");
      postItem = addStringNoLocale(postItem, "http://schema.org/text", text);
      postItem = addDatetime(postItem, "http://schema.org/date", new Date());
  
      // Define the webID
      const webID = session.info.webId;
      
      // Write the updated Thing back to the SolidDataset
      const updatedDataset = setThing(postDataset, postItem);
      // Save the updated SolidDataset back to the Pod
      await saveSolidDatasetAt(webID, updatedDataset, { fetch: session.fetch });

      // Rest textarea
      setText("");

      await getData();
      await getDataFriend();
    }
  }

  // ====================================
  // Read/Fetch all posts from dataset
  // ====================================
  const getData = async () => {
    if(session.info.isLoggedIn){
      const dataset = await getSolidDataset(session.info.webId,{ 
          fetch: session.fetch
      });
      
      // Get username
      const usernameThing = getThing(dataset, session.info.webId);
      const username = getStringNoLocale(usernameThing, "http://xmlns.com/foaf/0.1/name");
      
      // Get all Things in the dataset
      const things = getThingAll(dataset);

      // Select posts
      const posts = things.filter((thing) => getUrl(
          thing, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") === "http://schema.org/BlogPosting"
      );
      
      // Map over the posts to create an array of post objects
      const postData = posts.map((post) => {
          const post_text = getStringNoLocale(post, "http://schema.org/text");
          const post_date = getDatetime(post, "http://schema.org/date");
          return { username, post_text, post_date };
      });
      
      setData(postData);
    }
  };

  // ====================================
  // Read/Fetch friends posts
  // ====================================
  const getDataFriend = async () => {
    if(session.info.isLoggedIn){
      const myDataset = await getSolidDataset(session.info.webId,{ 
          fetch: session.fetch
      });
      let me = getThing(myDataset, session.info.webId);

      // Get all the foaf:knows relationships (get list of friends)
      const knowsUrls = getUrlAll(me, "http://xmlns.com/foaf/0.1/knows");
      knowsUrls.forEach(friendUrl => {
        getPostOfFriend(friendUrl);
      })
    }
  }

  const getPostOfFriend = async (friendUrl) => {
    // Get friend dataset
    const friendDataset = await getSolidDataset(friendUrl);

    // Get friend username
    const usernameThing = getThing(friendDataset, `${friendUrl}#me`);
    const username = getStringNoLocale(usernameThing, "http://xmlns.com/foaf/0.1/name");
    
    // Get all Things in the dataset
    const things = getThingAll(friendDataset);
    
    // Select posts
    const posts = things.filter((thing) => getUrl(
        thing, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") === "http://schema.org/BlogPosting"
    );
    
    // Map over the posts to create an array of post objects
    const postData = posts.map((post) => {
        const post_text = getStringNoLocale(post, "http://schema.org/text");
        const post_date = getDatetime(post, "http://schema.org/date");
        return { username, post_text, post_date };
    });
    
    // add friends post to my posts array
    setData((prevData) => {
      return prevData.concat(postData);
    });
  }


  // ====================================
  // Add followes (Add_FOAF_Knows)
  // ====================================
  const addFOAFKnows = async () => {
    if(session.info.isLoggedIn){
      const webID = session.info.webId;
      
      // Fetch the current user's profile data
      const myDataset = await getSolidDataset(webID, {
        fetch: session.fetch
      })
      let me = getThing(myDataset, webID);

      // Get all the foaf:knows relationships
      const knowsUrls = getUrlAll(me, "http://xmlns.com/foaf/0.1/knows");
      
      // Check if the entered URL is in the foaf:knows part
      if (knowsUrls.includes(newfriend)) {
        setInlist(true);
        setNewfriend("");
      } else {
        setInlist(false);
        // Add the follow relationship
        me = addUrl(me, "http://xmlns.com/foaf/0.1/knows", newfriend);
        const updatedMyDataset = setThing(myDataset, me);
        // Save updated dataset
        await saveSolidDatasetAt(webID, updatedMyDataset, { fetch: session.fetch });
        setNewfriend("");
      }
    }

    await showFriends();
    await getDataFriend();
  }

  // ====================================
  // Remove followes (Remove_FOAF_Knows)
  // ====================================
  const removeFOAFKnows = async (friendUrl) => {
    if(session.info.isLoggedIn){
      const webID = session.info.webId;
      
      // Fetch the current user's profile data
      const myDataset = await getSolidDataset(webID, {
        fetch: session.fetch
      })
      let me = getThing(myDataset, webID);

      // Remove selected friend
      const newDataset = removeUrl(me, "http://xmlns.com/foaf/0.1/knows", friendUrl);
      const updatedMyDataset = setThing(myDataset, newDataset);

      // Save updated dataset
      await saveSolidDatasetAt(webID, updatedMyDataset, {
        fetch: session.fetch
      })

      // Update UI
      await showFriends();
      await getData();
      await getDataFriend();
    }
  }
  // ====================================
  // Show All Friends You Follow
  // ====================================
  const showFriends = async () => {
    if(session.info.isLoggedIn){
      const webID = session.info.webId;
      
      // Fetch the current user's profile data
      const myDataset = await getSolidDataset(webID, {
        fetch: session.fetch
      })
      let me = getThing(myDataset, webID);

      // Get all the foaf:knows relationships
      const knowsUrls = getUrlAll(me, "http://xmlns.com/foaf/0.1/knows");

      // add to friendList
      setFriendList(knowsUrls);
    }
  }
  

  return (
    <div>
      <div className="navbar">
        <img src={logo} height={40} width={40} alt="logo"/>
        <h3>Solid Social Media</h3>
      </div>
      <hr />
        {session && session.info.isLoggedIn ? (
          <div>
              {/* Show username and WebID */}
              <div className="main">
                <label onClick={() => navigator.clipboard.writeText(session.info.webId.split("WebID: ")[0])}>
                    WebID: {session.info.webId}
                </label>
                <LogoutButton>
                  <button className="logout-btn">Log Out</button>
              </LogoutButton>
              </div>

              <details>
                <summary>My Username</summary>
                username: @{name}
              </details>

              {/* Upload a post */}
              <div>
                <div>
                  <details>
                    <summary>Create new post</summary>
                    <textarea value={text} maxLength={300} onChange={(e) => setText(e.target.value)} />
                    <label>
                      <button className="btn" onClick={saveTextPost}>Submit</button>
                    </label>
                    <div>
                      Length: {text.length}/300
                    </div>
                  </details>
                </div>
                  <div>
                    {/* Add new friends */}
                    <details>
                    <summary>Follow New Person</summary>
                    <div>
                      <input onInput={(e) => setNewfriend(e.target.value.split("#")[0])} placeholder="pod url of your friend" value={newfriend} />
                      <label>
                        <button className="btn" onClick={addFOAFKnows}>Follow</button>
                      </label>
                      {inlist && <div>You are following this person</div>}
                    </div>
                    </details>
                  </div>
                  {/* Show all friends */}
                  <div>
                    <details>
                      <summary>My Friends</summary>
                      {friendList.map((item, index) => {
                      return(
                        <ul key={index}>
                          <Friend url={item} unfollow={removeFOAFKnows} />
                        </ul>
                      )})}
                    </details>
                  </div>
              </div>
              {/* Show all posts */}
              <h2>All Posts</h2>
              {data.sort((a, b) => a.post_date - b.post_date).reverse().map((item, index) => {
                return(
                  <div key={index}>
                    <Post post_item={item} />
                  </div>
              )})}
          </div>
        ) : (
          <div>
            <div>
              <h2 style={{textAlign: "center"}}>Log in or Create new account</h2>
            </div>
            <div className="login">
              <LoginButton
              oidcIssuer="http://localhost:3000/" // community solid server
              redirectUrl={window.location.href} // react app hosted on port 5000
              authOptions={authOptions}
              >
                <button className="login-btn">Log In</button>
              </LoginButton>
            </div>
          </div>
        )}
    </div>
  );
}

export default App;
