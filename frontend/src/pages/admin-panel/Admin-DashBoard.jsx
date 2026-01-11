import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../pictures/auclogo.jpg';
import Addproduct from './Addproduct';
import Adduser from './Adduser';
import Sendmail from './Sendmail';
import Admin from './Admin';
import Editprofile from './Editprofile';
import Userreview from './Userreview';
import Users from './Users';
import Items from './Items';
import Approve from './Approve';
import Update from './Update';
import Recipts from './Recipts';
import Winner from './Winner';
import Notification from './Notification';
import { BASE_URL } from '../api/BaseUrrlForImage';
import API from '../api/API';


function Admindash() {
    const [activeSection, setActiveSection] = useState('dashboard');
    const handleButtonClick = (sectionId) => {
        setActiveSection(sectionId);
    };

    const [user_id, setUser_id] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const getUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await API.get("/access/userdash", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                setUser_id(response.data.userId);
            } catch (err) {
                console.error(err);
                navigate('/login');
            }
        };
        getUserData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    }

    const [data, setDashboardData] = useState({
        user_count: 0,
        product_count: 0,
        review_count: 0,
    });
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await API.get('/dashboard');
                setDashboardData(response.data[0]);
            } catch (err) {
                alert('Error fetching users:', err);
            }
        };

        fetchUsers();
    }, []);

    const total_ratio = () => {
        let { user_count, product_count } = data;

        if (product_count === 0) {
            return 'Product count is 0, cannot calculate ratio';
        }

        let ratio = (product_count / user_count) * 100;
        return ratio.toFixed(2);
    }

    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await API.get('/users');
                setUsers(response.data);
            } catch (err) {
                alert('Error fetching users:', err);
            }
        };

        fetchUsers();
    }, []);

    const [product, setProduct] = useState([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await API.get('/allitems');
                setProduct(response.data);
            } catch (err) {
                alert('Error fetching products:', err);
            }
        };

        fetchProduct();
    }, []);

    const [userSearch, setUserSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);


    const handleUserSearch = (e) => {
        e.preventDefault();
        if (!userSearch.trim()) {
            setFilteredUsers([]);
            return;
        }
        const result = users.filter((u) =>
            u.user_name.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.user_email.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.user_phone.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.user_street.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.user_district.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.user_state.toLowerCase().includes(userSearch.toLowerCase())
        );
        setFilteredUsers(result);
    };

    const handleProductSearch = (e) => {
        e.preventDefault();
        if (!productSearch.trim()) {
            setFilteredProducts([]);
            return;
        }
        const result = product.filter((p) =>
            p.productName.toLowerCase().includes(productSearch.toLowerCase()) ||
            p.otherName.toLowerCase().includes(productSearch.toLowerCase()) ||
            p.price.toString().includes(productSearch.toLowerCase()) ||
            p.type.toLowerCase().includes(productSearch.toLowerCase())
        );
        setFilteredProducts(result);
    };

    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const fetchPendingCount = async () => {
            try {
                const response = await API.get('/getCounts');
                setPendingCount(response.data.datus);
            } catch (error) {
                console.error('Error fetching count:', error);
            }
        };

        fetchPendingCount();
    }, []);

    return (
        <>
            <div className="w-full h-auto">
                <div className="flex justify-between items-center px-4 py-1 mt-1">
                    <div>
                        <p className="font-semibold text-xl md:text-2xl lg:text-3xl xl:text-4xl">
                            <a className="outline-none" href="/admin">
                                <span className="text-rose-700">My</span>Auction
                            </a>
                        </p>
                    </div>

                    <div className="flex justify-center items-center gap-2 md:gap-4">
                        <img className="h-6 sm:h-8 md:h-10 lg:h-12" src={logo} alt="Logo" />
                        <p className="hidden md:block text-xl md:text-2xl lg:text-3xl font-semibold p-0 m-0">
                            Online Auction System
                        </p>
                    </div>

                    <div className="flex gap-2 md:gap-4 items-center text-sm md:text-md lg:text-lg px-2 md:px-4 lg:px-8">
                        <button onClick={() => handleButtonClick('notify')} className="relative">
                            <i className="fa-regular fa-bell 
                                    text-blue-700 
                                    cursor-pointer 
                                    border border-gray-100 
                                    p-1.5 lg:p-2 
                                    text-base lg:text-xl 
                                    bg-gray-100 
                                    hover:bg-blue-700 hover:text-white 
                                    rounded-full
                                "></i>

                            {pendingCount > 0 && (
                                <span className="
                                        absolute -top-1 -right-1 
                                        bg-red-600 text-white 
                                        text-[10px] lg:text-xs 
                                        font-bold 
                                        px-1 py-0.5 
                                        rounded-full 
                                        leading-none
                                    ">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                        <button onClick={() => handleButtonClick('sendmail')}>
                            <i className="fa-regular fa-envelope text-red-600 cursor-pointer border border-gray-100 p-1 md:p-2 bg-gray-100 hover:bg-red-600 hover:text-white rounded-full"></i>
                        </button>
                        <button onClick={handleLogout}>
                            <i className="fa-solid fa-right-to-bracket cursor-pointer border border-gray-100 p-1 md:p-2 bg-gray-100 hover:bg-black hover:text-white rounded-full"></i>
                        </button>
                    </div>
                </div>
                <div className="w-full flex gap-2 p-2">
                    <div className="w-1/5 block space-y-2 text-[14px] font-semibold md:block md:space-y-2 md:text-[14px] md:font-semibold">
                        <button
                            className={`flex items-center px-4 w-full py-2 border border-gray-200 rounded-sm cursor-pointer shadow-md ${activeSection === 'dashboard' ? 'bg-gray-600 text-white' : ''
                                }`}
                            onClick={() => handleButtonClick('dashboard')}
                        >
                            <i className="fa-regular fa-window-restore mx-2"></i> <span className="hidden lg:inline">DashBoard</span>
                        </button>
                        <button
                            className={`flex items-center px-4 w-full py-2 border border-gray-200 rounded-sm cursor-pointer shadow-md ${activeSection === 'approve' ? 'bg-gray-600 text-white' : ''
                                }`}
                            onClick={() => handleButtonClick('approve')}
                        >
                            <i className="fa-solid fa-square-check mx-2"></i> <span className="hidden lg:inline">Approve Request</span>
                        </button>
                        <button
                            className={`flex items-center px-4 w-full py-2 border border-gray-200 rounded-sm cursor-pointer shadow-md ${activeSection === 'updatereq' ? 'bg-gray-600 text-white' : ''
                                }`}
                            onClick={() => handleButtonClick('updatereq')}
                        >
                            <i className="fa-solid fa-pen-to-square mx-2"></i> <span className="hidden lg:inline">Update Request</span>
                        </button>
                        <button
                            className={`flex items-center px-4 w-full py-2 border border-gray-200 rounded-sm cursor-pointer shadow-md ${activeSection === 'allitems' ? 'bg-gray-600 text-white' : ''
                                }`}
                            onClick={() => handleButtonClick('allitems')}
                        >
                            <i className="fa-solid fa-list mx-2"></i> <span className="hidden lg:inline">View Items</span>
                        </button>
                        <button
                            className={`flex items-center px-4 w-full py-2 border border-gray-200 rounded-sm cursor-pointer shadow-md ${activeSection === 'successful' ? 'bg-gray-600 text-white' : ''
                                }`}
                            onClick={() => handleButtonClick('successful')}
                        >
                            <i className="fa-solid fa-ranking-star mx-2"></i> <span className="hidden lg:inline">View Winners</span>
                        </button>
                        <button
                            className={`flex items-center px-4 w-full py-2 border border-gray-200 rounded-sm cursor-pointer shadow-md ${activeSection === 'users' ? 'bg-gray-600 text-white' : ''
                                }`}
                            onClick={() => handleButtonClick('users')}
                        >
                            <i className="fa-solid fa-users mx-2"></i> <span className="hidden lg:inline">View Users</span>
                        </button>
                        <button
                            className={`flex items-center px-4 w-full py-2 border border-gray-200 rounded-sm cursor-pointer shadow-md ${activeSection === 'recipt' ? 'bg-gray-600 text-white' : ''
                                }`}
                            onClick={() => handleButtonClick('recipt')}
                        >
                            <i className="fa-regular fa-clipboard mx-2"></i> <span className="hidden lg:inline">Checkout Recipt</span>
                        </button>
                        <button
                            className={`flex items-center px-4 w-full py-2 border border-gray-200 rounded-sm cursor-pointer shadow-md ${activeSection === 'reviews' ? 'bg-gray-600 text-white' : ''
                                }`}
                            onClick={() => handleButtonClick('reviews')}
                        >
                            <i className="fa-brands fa-readme mx-2"></i> <span className="hidden lg:inline">User Reviews</span>
                        </button>
                        <button
                            className={`flex items-center px-4 w-full py-2 border border-gray-200 rounded-sm cursor-pointer shadow-md ${activeSection === 'adduser' ? 'bg-gray-600 text-white' : ''
                                }`}
                            onClick={() => handleButtonClick('adduser')}
                        >
                            <i className="fa-solid fa-user-plus mx-2"></i> <span className="hidden lg:inline">Add User</span>
                        </button>
                        <button
                            className={`flex items-center px-4 w-full py-2 border border-gray-200 rounded-sm cursor-pointer shadow-md ${activeSection === 'additems' ? 'bg-gray-600 text-white' : ''
                                }`}
                            onClick={() => handleButtonClick('additems')}
                        >
                            <i className="fa-solid fa-plus mx-2"></i> <span className="hidden lg:inline">Add Items</span>
                        </button>
                        <button
                            className={`flex items-center px-4 w-full py-2 border border-gray-200 rounded-sm cursor-pointer shadow-md ${activeSection === 'profile' ? 'bg-gray-600 text-white' : ''
                                }`}
                            onClick={() => handleButtonClick('profile')}
                        >
                            <i className="fa-solid fa-user mx-2"></i> <span className="hidden lg:inline">Admin Profile</span>
                        </button>
                        <button
                            className={`flex items-center px-4 w-full py-2 border border-gray-200 rounded-sm cursor-pointer shadow-md ${activeSection === 'editprofile' ? 'bg-gray-600 text-white' : ''
                                }`}
                            onClick={() => handleButtonClick('editprofile')}
                        >
                            <i className="fa-solid fa-user-pen mx-2"></i> <span className="hidden lg:inline">Edit Admin Profile</span>
                        </button>
                    </div>
                    <div className="w-4/5 border-l border-t border-gray-200">
                        <div
                            id="dashboard"
                            className={`h-[600px] w-full overflow-y-scroll ${activeSection === 'dashboard' ? 'block' : 'hidden'
                                }`} >
                            <div className="w-full">
                                <div className="flex flex-wrap md:flex-nowrap bg-gray-100 p-2 justify-between gap-2 mb-4">
                                    <div className="bg-red-500 text-gray-100 w-full sm:w-1/2 md:w-1/4 rounded p-2">
                                        <p className="text-xs sm:text-sm md:text-[14px]">Total user</p>
                                        <h1 className="text-sm sm:text-md md:text-[18px] font-semibold px-2 sm:px-4">
                                            {data.user_count} in total
                                        </h1>
                                        <div className="flex gap-1 text-[10px] sm:text-[12px] md:text-[13px] items-center px-1 sm:px-2">
                                            <i className="fa-solid fa-arrow-up text-green-700"></i>
                                            <i className="fa-solid fa-arrow-down text-red-700"></i>
                                            <span>Since last time</span>
                                        </div>
                                    </div>

                                    <div className="bg-green-500 text-gray-100 w-full sm:w-1/2 md:w-1/4 rounded p-2">
                                        <p className="text-xs sm:text-sm md:text-[14px]">Total product</p>
                                        <h1 className="text-sm sm:text-md md:text-[18px] font-semibold px-2 sm:px-4">
                                            {data.product_count} in total
                                        </h1>
                                        <div className="flex gap-1 text-[10px] sm:text-[12px] md:text-[13px] items-center px-1 sm:px-2">
                                            <i className="fa-solid fa-arrow-up text-green-700"></i>
                                            <i className="fa-solid fa-arrow-down text-red-700"></i>
                                            <span>Since last time</span>
                                        </div>
                                    </div>

                                    <div className="bg-blue-500 text-gray-100 w-full sm:w-1/2 md:w-1/4 rounded p-2">
                                        <p className="text-xs sm:text-sm md:text-[14px]">Total reviews</p>
                                        <h1 className="text-sm sm:text-md md:text-[18px] font-semibold px-2 sm:px-4">
                                            {data.review_count} in total
                                        </h1>
                                        <div className="flex gap-1 text-[10px] sm:text-[12px] md:text-[13px] items-center px-1 sm:px-2">
                                            <i className="fa-solid fa-arrow-up text-green-700"></i>
                                            <i className="fa-solid fa-arrow-down text-red-700"></i>
                                            <span>Since last time</span>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-500 text-gray-100 w-full sm:w-1/2 md:w-1/4 rounded p-2">
                                        <p className="text-xs sm:text-sm md:text-[14px]">Total ratio</p>
                                        <h1 className="text-sm sm:text-md md:text-[18px] font-semibold px-2 sm:px-4">
                                            {total_ratio()} in total
                                        </h1>
                                        <div className="flex gap-1 text-[10px] sm:text-[12px] md:text-[13px] items-center px-1 sm:px-2">
                                            <i className="fa-solid fa-arrow-up text-green-700"></i>
                                            <i className="fa-solid fa-arrow-down text-red-700"></i>
                                            <span>Since last time</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-100 w-full p-2 mb-4 flex justify-around">
                                    <form onSubmit={handleUserSearch} className="flex gap-2 bg-white w-[300px] px-2 rounded-md border border-gray-200 text-[14px]">
                                        <input type="text"
                                            name="usersearch"
                                            placeholder="Search user..."
                                            className="outline-none px-2 py-1 w-full"
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                        />
                                        <button className="cursor-pointer"
                                            type="submit">
                                            <i className="fa-solid fa-magnifying-glass"></i>
                                        </button>
                                    </form>
                                    <form onSubmit={handleProductSearch} className="flex gap-2 bg-white w-[300px] px-2 rounded-md border border-gray-200 text-[14px]">
                                        <input type="text"
                                            name="usersearch"
                                            placeholder="Search product..."
                                            className="outline-none px-2 py-1 w-full"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                        />
                                        <button className="cursor-pointer"
                                            type="submit">
                                            <i className="fa-solid fa-magnifying-glass"></i>
                                        </button>
                                    </form>
                                </div>

                                <div className="p-2">
                                    {filteredUsers.length > 0 && (
                                        <div id="users" className="overflow-x-auto bg-white p-2"
                                        >
                                            <table className="w-full table-auto">
                                                <thead>
                                                    <tr className="bg-gray-200 text-gray-800 uppercase text-sm leading-normal">
                                                        <th className="py-3 px-6 text-left">ID</th>
                                                        <th className="py-3 px-6 text-left">Profile</th>
                                                        <th className="py-3 px-6 text-left">Name</th>
                                                        <th className="py-3 px-6 text-left">Email</th>
                                                        <th className="py-3 px-6 text-left">Contact</th>
                                                        <th className="py-3 px-6 text-left">Street</th>
                                                        <th className="py-3 px-6 text-left">District</th>
                                                        <th className="py-3 px-6 text-left">State</th>
                                                        <th className="py-3 px-6 text-left">Created at</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-gray-700 text-sm">
                                                    {filteredUsers.map(user => (
                                                        <tr className="border-b border-gray-200 hover:bg-gray-100" key={user.user_id}>
                                                            <td className="py-3 px-6 text-left">{user.user_id}</td>
                                                            <td className="py-3 px-6 text-left">
                                                                <img className="h-12" src={user.user_profile ? `${BASE_URL}/uploads/${user.user_profile}` : profilePicSrc} alt="" />
                                                            </td>
                                                            <td className="py-3 px-6 text-left">{user.user_name}</td>
                                                            <td className="py-3 px-6 text-left">{user.user_email}</td>
                                                            <td className="py-3 px-6 text-left">{user.user_phone}</td>
                                                            <td className="py-3 px-6 text-left">{user.user_street}</td>
                                                            <td className="py-3 px-6 text-left">{user.user_district}</td>
                                                            <td className="py-3 px-6 text-left">{user.user_state}</td>
                                                            <td className="py-3 px-6 text-left">
                                                                {new Date(user.created_at).toLocaleString('en-US', {
                                                                    weekday: 'short',
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    second: '2-digit',
                                                                })}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {filteredProducts.length > 0 && (
                                        <div id="products" className="overflow-x-auto bg-white p-2"
                                        >
                                            <table className="w-full table-auto">
                                                <thead>
                                                    <tr className="bg-gray-200 text-gray-800 uppercase text-sm leading-normal">
                                                        <th className="py-3 px-6 text-left">PID</th>
                                                        <th className="py-3 px-6 text-left">Image</th>
                                                        <th className="py-3 px-6 text-left">Product Name</th>
                                                        <th className="py-3 px-6 text-left">Other Name</th>
                                                        <th className="py-3 px-6 text-left">Price</th>
                                                        <th className="py-3 px-6 text-left">Type</th>
                                                        <th className="py-3 px-6 text-left">Auction Days</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-gray-700 text-sm">
                                                    {filteredProducts.map(data => (
                                                        <tr className="border-b border-gray-200 hover:bg-gray-100" key={data.product_id}>
                                                            <td className="py-3 px-6 text-left">{data.product_id}</td>
                                                            <td className="py-3 px-6 text-left">
                                                                {JSON.parse(data.proImage)[0] && (
                                                                    <img
                                                                        className="h-12"
                                                                        src={`${BASE_URL}/productImage/${JSON.parse(data.proImage)[0]}`}
                                                                        alt="Product Image"
                                                                    />
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-6 text-left">{data.productName}</td>
                                                            <td className="py-3 px-6 text-left">{data.otherName}</td>
                                                            <td className="py-3 px-6 text-left">{data.price}</td>
                                                            <td className="py-3 px-6 text-left">{data.type}</td>
                                                            <td className="py-3 px-6 text-left">{data.days}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div
                            id="approve"
                            className={`h-[600px] w-full overflow-y-scroll p-2 ${activeSection === 'approve' ? 'block' : 'hidden'
                                }`} >
                            <Approve />
                        </div>
                        <div
                            id="updatereq"
                            className={`h-[600px] w-full overflow-y-scroll p-2 ${activeSection === 'updatereq' ? 'block' : 'hidden'
                                }`} >
                            <Update />
                        </div>
                        <div
                            id="allitems"
                            className={`h-[600px] w-full overflow-y-scroll ${activeSection === 'allitems' ? 'block' : 'hidden'
                                }`} >
                            <Items />
                        </div>
                        <div
                            id="successful"
                            className={`h-[600px] w-full overflow-y-scroll ${activeSection === 'successful' ? 'block' : 'hidden'
                                }`} >
                            <Winner />
                        </div>
                        <div
                            id="users"
                            className={`h-[600px] w-full overflow-y-scroll ${activeSection === 'users' ? 'block' : 'hidden'
                                }`} >
                            <Users />
                        </div>
                        <div
                            id="recipt"
                            className={`h-[600px] w-full overflow-y-scroll p-2 ${activeSection === 'recipt' ? 'block' : 'hidden'
                                }`} >
                            <Recipts />
                        </div>
                        <div
                            id="reviews"
                            className={`h-[600px] w-full overflow-y-scroll ${activeSection === 'reviews' ? 'block' : 'hidden'
                                }`} >
                            <Userreview />
                        </div>
                        <div
                            id="adduser"
                            className={`h-[600px] w-full overflow-y-scroll ${activeSection === 'adduser' ? 'block' : 'hidden'
                                }`} >
                            <Adduser />
                        </div>
                        <div
                            id="additems"
                            className={`h-[600px] w-full overflow-y-scroll ${activeSection === 'additems' ? 'block' : 'hidden'
                                }`} >
                            <Addproduct />
                        </div>
                        <div
                            id="profile"
                            className={`h-[600px] w-full overflow-y-scroll ${activeSection === 'profile' ? 'block' : 'hidden'
                                }`} >
                            {user_id !== null && <Admin uid={user_id} />}
                        </div>
                        <div
                            id="editprofile"
                            className={`h-[600px] w-full overflow-y-scroll ${activeSection === 'editprofile' ? 'block' : 'hidden'
                                }`} >
                            {user_id !== null && <Editprofile ussid={user_id} />}
                        </div>
                        <div
                            id="notify"
                            className={`h-[600px] w-full overflow-y-scroll ${activeSection === 'notify' ? 'block' : 'hidden'
                                }`} >
                            <Notification />
                        </div>
                        <div
                            id="sendmail"
                            className={`h-[600px] w-full overflow-y-scroll ${activeSection === 'sendmail' ? 'block' : 'hidden'
                                }`} >
                            <Sendmail />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Admindash
