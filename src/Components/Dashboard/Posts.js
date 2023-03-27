import '../../css/dashboard/new.css'
import Avatar from '../../imgs/avatar.jpg'
import Carnival from '../../imgs/carnival.jpg'
import React, { useState, useEffect } from 'react';
import $ from 'jquery'
import {Link, useNavigate} from 'react-router-dom'


$(document).ready(()=>{
  const likeBtn = $('.like-btn');
  const tabBtns = $('.tab-btn');
  const dropdownHeader = $('.dropdown-header');
  const dropdownContent = $('.dropdown-content');
  dropdownContent.css('display', 'hidden')
  const downArrow = $('.dropdown-header .fa-caret-down');
  const upArrow = $('.dropdown-content .fa-caret-up');

  tabBtns.each(function() {
    $(this).on('click', function() {
      // Get the data-tab attribute value of the clicked button
      const tab = $(this).attr('data-tab');

      // Get all the tab content elements
      const tabContents = $('.tab-content');

      // Deactivate all tab buttons and hide all tab contents
      tabBtns.removeClass('active');
      tabContents.removeClass('active');

      // Activate the clicked tab button and show the corresponding tab content
      $(this).addClass('active');
      $('#' + tab + '-tab').addClass('active');
    });
  });


  $(window).on('scroll', function() {
    const navbar = $('.navbar');
    navbar.toggleClass('scrolled', $(this).scrollTop() > 0);
  });
  
  dropdownHeader.on('click', function() {
    // dropdownContent.toggleClass('open');
    dropdownContent.fadeIn('fast')
  });
  
  downArrow.on('click', function() {
    dropdownContent.fadeIn('fast')
    // dropdownContent.toggleClass('open');
  });
  
  upArrow.on('click', function() {
    // dropdownContent.removeClass('open');
    dropdownContent.fadeOut('fast')
  });
})

export default function Posts(){

  const navigate = useNavigate()

  let [blogPosts, setBlogPosts] = useState([]);
  let [user, setUser] = useState(null)
  let [all_users, setAllUsers] = useState([])
  let [token, setToken] = useState(null)
  let [logged_in, setLogged_in] = useState(false)
  let [error, setError] = useState('')
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

    
  const handleSubmit = async (event) => {
    // event.preventDefault();

    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('image', event.target.image.files[0]);

    console.log(`Submitting, ID: ${user.id} \nTitle: ${title} \nDescription: ${description} \nImage: ${event.target.image.files[0]}`)
    try {
      const response = await fetch('http://localhost:3001/testblogs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload blog post')
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Catching error:\n" + error);
    }
  };

  function handlelogOut() {
    fetch('http://localhost:3001/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
    .then(response => {
      if (response.ok) {
        localStorage.clear();
        // window.location.href = '/';
        navigate('/')
      } else {
        response.json().then(error => console.log(error));
      }
    })
    .catch(error => console.log(error));
  };

  useEffect(() => {
    
    (async function fetchCurrentUser(){
      try{
        const token = localStorage.getItem('token')

        if(token){
          const response = await fetch('http://localhost:3001/user',{
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
          })
          setLogged_in(true)
          const data = await response.json();
          setUser(data.user);
          // console.log(`Found user ${data.user.name}`)
        }
      }catch(error){
        console.error(error)
      }
    })();
    
    (async function fetchAllUsers(){
      try{

          const response = await fetch('http://localhost:3001/all_users',{
            method: 'GET',
            headers: { 'Content-Type': 'application/json'}
          })
          const data = await response.json();
          setAllUsers(data.user);
          // console.log(`Found user ${data.user.name}`)
      }catch(error){
        console.error(error)
      }
    })();
    
    (async function fetchPosts() {
      try {
        const response = await fetch("http://localhost:3001/blogposts-with-users");
        if (!response.ok) {
          throw new Error("Something went wrong while fetching the data.");
        }
        const data = await response.json();
        setBlogPosts(data.blogposts); // Fix - use array of blog posts received from the API.
      } catch (error) {
        setError(error.message);
      }
    })();

  }, [token]);
  
  if (error) {
    console.error(error)
  }
    return(
        <div className="posts">
               <nav className="navbar">
                    <a href="#" className="logo">ATZ</a>
                    <div className="search-bar">
                    <input type="text" placeholder="Search..." /><i className="fa fa-search"></i>
                    <button type="submit" className="searchbtn">Search</button>
                    </div>
                    <ul className="nav-links">
                      <li><Link to="/" style={{"marginLeft": "85%"}}><i className="fa fa-home"></i></Link></li>
                      <li>
                     
                      </li>
                      <li><a href="#"><i className="fa fa-user"></i></a></li>
                      <li><a href="#"><i className="fa fa-bell"></i></a></li>
                      <li><a href="#"><i className="fa fa-envelope"></i></a></li>
                      {logged_in ? (
                          <Link to="/" onClick={handlelogOut} style={{ fontSize: ".8rem" }}>
                            <span className="fa-stack fa-lg pull-left">
                              <i className="fa-solid fa-right-from-bracket" style={{ marginLeft: "50%" }}></i>
                            </span>
                            Logout
                          </Link>
                        ) : (
                          <Link to="/members/login" style={{ fontSize: ".8rem", "marginTop": "2%" }}>Login/Signup</Link>
                        )}
                    </ul>

                </nav>

          <div className="center">
             {/* Dropdown */}
             {logged_in ? (
                  <div className="dropdown">

                    <div className="dropdown-header">
                    <span>What's on your mind?</span>
                    <i className="fa-solid fa-image"></i>
                    <i className="fa-solid fa-video"></i>
                    <i className="fas fa-caret-down"></i>
                    </div>

                    <div className="dropdown-content">
                    <form  onSubmit={handleSubmit} encType="multipart/form-data">
                        <div>
                            <textarea id="message-input" name="description" 
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            required
                            placeholder="Type your message here" />

                        <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={(event) => setImage(URL.createObjectURL(event.target.files[0]))}
                                  />
                        </div>        
                        <button type="submit" >Post</button>
                        <button type="button" onClick={()=>{
                          $('.dropdown-content').fadeOut('fast')
                        }} style={{'display': 'inline'}}>Close</button>
                    <i className="fas fa-caret-down"></i>

                    </form>

                    </div>
                    <br/><br/>
                    </div>

                ) : null}
                {/* End of dropdown */}

                {/* TABS */}
                <div className="tabbuttons">
                    <div className="tabs">
                        <button className="tab-btn active" data-tab="all">All</button>
                        <button className="tab-btn" data-tab="parts">Events</button>
                        <button className="tab-btn" data-tab="machines">Culinary</button>
                    </div>
                </div>  
                
                {/* ALL */}
                <div id="all-tab" className="tab-content active">   
                          {blogPosts && blogPosts.length > 0 && all_users ? (
                            blogPosts.map((post, index) => {
                                const currentUser = all_users.filter((user) => user.id === post.user_id)[0];
                                return (
                                    <section className={`post section-${index + 1}`} key={post.id}>
                                        <div className="post-header">
                                            <img src={Avatar} alt="user profile picture"/>
                                            <div className="post-info">
                                                <h2>{currentUser.name}</h2>
                                                <p>{post.created_at}</p>
                                            </div>
                                        </div>
                                        <div className="post-content">
                                            <p>{post.description}</p>
                                            <img className='blogImage' src={`http://localhost:3001/Images/${post.image}`} alt={post.image} />
                                        </div>
                                        <div className="post-actions">
                                            <button id={`like-button-${post.id}`} className="like-button">
                                                <i className="fa fa-heart"></i>
                                                <span className="like-count">2000</span>
                                            </button>
                                            <button><i className="fa fa-comment"></i> Comment</button>
                                            <button><i className="fa fa-share"></i> Share</button>
                                        </div>
                                    </section>
                                )
                            })
                        ) : (
                            <section className="post">
                                <h1>Loading please wait...</h1>
                            </section>
                        )} 

                
                 
                </div>
          </div>
               
        </div>
 
    )
}