import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RealEstateMarketplaceContract from './contracts/RealEstateMarketplace.json';
import PropertyList from './components/PropertyList';
import PropertyForm from './components/PropertyForm';
import UserProperties from './components/UserProperties';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [properties, setProperties] = useState([]);
  const [userProperties, setUserProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [selectedAccount, setSelectedAccount] = useState(0);
  const [transactionsInProgress, setTransactionsInProgress] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ show: false, propertyId: null, price: null });

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        // Modern dapp browsers with MetaMask
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log("Connected via MetaMask");
            setWeb3(web3Instance);
            return web3Instance;
          } catch (error) {
            console.log("User denied account access or error occurred with MetaMask");
            // Will try Ganache next
          }
        }
        
        // Try Ganache as fallback
        console.log("Trying to connect to Ganache...");
        const ganacheProvider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
        const web3Instance = new Web3(ganacheProvider);
        
        try {
          // Test if connected to Ganache
          const accounts = await web3Instance.eth.getAccounts();
          if (accounts && accounts.length > 0) {
            console.log("Connected to Ganache");
            setWeb3(web3Instance);
            return web3Instance;
          }
        } catch (error) {
          console.log("Could not connect to Ganache:", error);
        }
        
        // Legacy dapp browsers
        if (window.web3) {
          const legacyWeb3 = new Web3(window.web3.currentProvider);
          setWeb3(legacyWeb3);
          return legacyWeb3;
        }
        
        // No Web3 provider found
        showNotification("No Ethereum browser extension detected and Ganache is not running. Please install MetaMask or start Ganache.", "error");
        return null;
      } catch (error) {
        console.error("Could not connect to any Web3 provider:", error);
        showNotification("Failed to connect to blockchain. Check console for details.", "error");
        return null;
      }
    };

    initWeb3();
  }, []);

  useEffect(() => {
    if (!web3) return;
  
    const initContract = async () => {
      // if (!web3Instance) return;
      try {
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = RealEstateMarketplaceContract.networks[networkId];
  
        if (!deployedNetwork) {
          console.error("Contract not deployed to detected network");
          showNotification("Contract not found on the current network. Please connect to the correct network.", "error");
          setLoading(false);
          return;
        }
  
        const contractInstance = new web3.eth.Contract(
          RealEstateMarketplaceContract.abi,
          deployedNetwork && deployedNetwork.address,
        );
  
        setContract(contractInstance);
  
        // Get accounts
        const accs = await web3.eth.getAccounts();
        setAccounts(accs);
  
        // Setup event listeners
        setupEventListeners(contractInstance);
  
        // Load properties
        await loadProperties(contractInstance, accs[selectedAccount]);
  
        setLoading(false);
        showNotification("Connected to the blockchain successfully!", "success");
      } catch (error) {
        console.error("Failed to initialize contract:", error);
        showNotification("Failed to initialize contract. Please check the console for more details.", "error");
        setLoading(false);
      }
    };
  
    initContract();
  }, [web3, selectedAccount]); // Add selectedAccount as a dependency

  const showNotification = (message, type) => {
    toast[type](message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  const setupEventListeners = (contractInstance) => {
    // Remove previous event listeners if they exist
    if (contractInstance.events.PropertyListed) {
      contractInstance.events.PropertyListed().unsubscribe();
    }
    if (contractInstance.events.PropertySold) {
      contractInstance.events.PropertySold().unsubscribe();
    }
  
    contractInstance.events.PropertyListed({
      fromBlock: 'latest'
    }, async (error, event) => {
      if (error) {
        console.error("Error on PropertyListed event:", error);
        return;
      }
      
      console.log("Property listed event received:", event);
      
      const propertyId = parseInt(event.returnValues.propertyId);
      
      try {
        // Get the full property details
        const property = await contractInstance.methods.getProperty(propertyId).call();
        
        // Use the current account from state
        const isOwner = await contractInstance.methods.isOwner(propertyId).call({ 
          from: accounts[selectedAccount] 
        });
        
        const formattedProperty = {
          id: propertyId,
          name: property[0],
          location: property[1],
          description: property[2],
          imageUrl: property[3],
          price: web3.utils.fromWei(property[4], 'ether'),
          size: property[5],
          bedrooms: property[6],
          bathrooms: property[7],
          owner: property[8],
          isForSale: property[9],
          isCurrentUserOwner: isOwner
        };
        
        // Update the properties list with the new property
        setProperties(prevProperties => {
          // Check if property already exists, if so update it
          const existingPropertyIndex = prevProperties.findIndex(p => p.id === propertyId);
          if (existingPropertyIndex >= 0) {
            const updatedProperties = [...prevProperties];
            updatedProperties[existingPropertyIndex] = formattedProperty;
            return updatedProperties;
          } else {
            // Add new property
            return [...prevProperties, formattedProperty];
          }
        });
        
        // If current user is the owner, update userProperties too
        if (isOwner) {
          setUserProperties(prevUserProperties => {
            const existingPropertyIndex = prevUserProperties.findIndex(p => p.id === propertyId);
            if (existingPropertyIndex >= 0) {
              const updatedProperties = [...prevUserProperties];
              updatedProperties[existingPropertyIndex] = formattedProperty;
              return updatedProperties;
            } else {
              return [...prevUserProperties, formattedProperty];
            }
          });
        }
        
        // Clear transaction in progress status
        setTransactionsInProgress(prev => {
          const updated = {...prev};
          delete updated[`list-${propertyId}`];
          return updated;
        });
        
        showNotification("Property listed successfully!", "success");
      } catch (error) {
        console.error("Error processing property listed event:", error);
        showNotification("Error updating UI after property listing", "error");
      }
    });
  
    contractInstance.events.PropertySold({
      fromBlock: 'latest'
    }, async (error, event) => {
      if (error) {
        console.error("Error on PropertySold event:", error);
        return;
      }
      
      console.log("Property sold event received:", event);
      
      const propertyId = parseInt(event.returnValues.propertyId);
      const newOwner = event.returnValues.newOwner;
      
      // Use the current account from state
      const currentUserIsNewOwner = accounts[selectedAccount].toLowerCase() === newOwner.toLowerCase();
      
      try {
        // Get updated property details
        const property = await contractInstance.methods.getProperty(propertyId).call();
        
        // Use the current account from state
        const isCurrentUserOwner = await contractInstance.methods.isOwner(propertyId).call({ 
          from: accounts[selectedAccount] 
        });
        
        const formattedProperty = {
          id: propertyId,
          name: property[0],
          location: property[1],
          description: property[2],
          imageUrl: property[3],
          price: web3.utils.fromWei(property[4], 'ether'),
          size: property[5],
          bedrooms: property[6],
          bathrooms: property[7],
          owner: property[8],
          isForSale: property[9],
          isCurrentUserOwner: isCurrentUserOwner
        };
        
        // Update properties list
        setProperties(prevProperties => {
          return prevProperties.map(p => 
            p.id === propertyId ? formattedProperty : p
          );
        });
        
        // Update user properties based on ownership change
        setUserProperties(prevUserProperties => {
          if (currentUserIsNewOwner) {
            // Add to user properties if the current user is the new owner
            const existingPropertyIndex = prevUserProperties.findIndex(p => p.id === propertyId);
            if (existingPropertyIndex >= 0) {
              const updatedProperties = [...prevUserProperties];
              updatedProperties[existingPropertyIndex] = formattedProperty;
              return updatedProperties;
            } else {
              return [...prevUserProperties, formattedProperty];
            }
          } else {
            // Remove from user properties if the current user sold it
            return prevUserProperties.filter(p => p.id !== propertyId);
          }
        });
        
        // Clear transaction in progress status
        setTransactionsInProgress(prev => {
          const updated = {...prev};
          delete updated[`buy-${propertyId}`];
          return updated;
        });
        
        if (currentUserIsNewOwner) {
          showNotification("Congratulations! You've successfully purchased the property.", "success");
        } else {
          showNotification("Property sold successfully!", "success");
        }
      } catch (error) {
        console.error("Error processing property sold event:", error);
        showNotification("Error updating UI after property sale", "error");
      }
    });
  };

  // This function will be called after price update or toggle sale status
  const updatePropertyInUI = async (contractInstance, propertyId) => {
    try {
      // Get the updated property details
      const property = await contractInstance.methods.getProperty(propertyId).call();
      const isOwner = await contractInstance.methods.isOwner(propertyId).call({ 
        from: accounts[selectedAccount] 
      });
      
      const formattedProperty = {
        id: propertyId,
        name: property[0],
        location: property[1],
        description: property[2],
        imageUrl: property[3],
        price: web3.utils.fromWei(property[4], 'ether'),
        size: property[5],
        bedrooms: property[6],
        bathrooms: property[7],
        owner: property[8],
        isForSale: property[9],
        isCurrentUserOwner: isOwner
      };
      
      // Update the properties list
      setProperties(prevProperties => {
        return prevProperties.map(p => 
          p.id === propertyId ? formattedProperty : p
        );
      });
      
      // Update user properties if the current user is the owner
      if (isOwner) {
        setUserProperties(prevUserProperties => {
          return prevUserProperties.map(p => 
            p.id === propertyId ? formattedProperty : p
          );
        });
      }
      
      // Clear transaction in progress status
      setTransactionsInProgress(prev => {
        const updated = {...prev};
        delete updated[`toggle-${propertyId}`];
        delete updated[`price-${propertyId}`];
        return updated;
      });
    } catch (error) {
      console.error("Error updating property in UI:", error);
      showNotification("Error updating property information in UI", "error");
    }
  };

  const loadProperties = async (contractInstance, account) => {
    try {
      console.log("Contract address:", contractInstance.options.address);
      
      const propertyCount = await contractInstance.methods.getPropertyCount().call({
        from: account,
        gas: 100000
      });
      
      console.log("Property count:", propertyCount);
      
      const allProperties = [];
      const userOwnedProperties = [];
  
      if (propertyCount && propertyCount > 0) {
        for (let i = 0; i < propertyCount; i++) {
          try {
            const property = await contractInstance.methods.getProperty(i).call({
              from: account,
              gas: 100000
            });
            
            const isOwner = await contractInstance.methods.isOwner(i).call({ 
              from: account,
              gas: 100000
            });
  
            const formattedProperty = {
              id: i,
              name: property[0],
              location: property[1],
              description: property[2],
              imageUrl: property[3],
              price: web3.utils.fromWei(property[4], 'ether'),
              size: property[5],
              bedrooms: property[6],
              bathrooms: property[7],
              owner: property[8],
              isForSale: property[9],
              isCurrentUserOwner: isOwner
            };
  
            allProperties.push(formattedProperty);
  
            if (isOwner) {
              userOwnedProperties.push(formattedProperty);
            }
          } catch (propertyError) {
            console.error(`Error loading property ${i}:`, propertyError);
          }
        }
      }
  
      setProperties(allProperties);
      setUserProperties(userOwnedProperties);
    } catch (error) {
      console.error("Error loading properties:", error);
      showNotification("Error loading properties from the contract", "error");
    }
  };

  const handleListProperty = async (formData) => {
    try {
      setLoading(true);
      
      // Convert numeric fields to appropriate formats
      const priceInWei = web3.utils.toWei(formData.price.toString(), 'ether');
      const size = parseInt(formData.size);
      const bedrooms = parseInt(formData.bedrooms);
      const bathrooms = parseInt(formData.bathrooms);

      // Validate numeric conversions
      if (isNaN(size) || isNaN(bedrooms) || isNaN(bathrooms)) {
        showNotification("Please enter valid numbers for size, bedrooms, and bathrooms", "error");
        setLoading(false);
        return;
      }

      // Validate string fields
      if (!formData.name || !formData.location || !formData.description) {
        showNotification("Please fill in all required fields", "error");
        setLoading(false);
        return;
      }
  
      // Use call first to check if the transaction would succeed
      try {
        await contract.methods.listProperty(
          formData.name,           // string: name
          formData.location,       // string: location
          formData.description,    // string: description
          formData.imageUrl || '', // string: imageUrl
          priceInWei,             // uint256: price in wei
          size,                    // uint256: size in square feet
          bedrooms,               // uint8: number of bedrooms
          bathrooms               // uint8: number of bathrooms
        ).call({ from: accounts[selectedAccount] });
      } catch (error) {
        console.error("Validation error:", error);
        showNotification(`Error: ${error.message.split('revert ')[1] || error.message}`, "error");
        setLoading(false);
        return;
      }
  
      // Add a transaction in progress marker
      const tempId = Date.now();
      setTransactionsInProgress(prev => ({...prev, [`list-${tempId}`]: true}));
      
      showNotification("Listing property... Please wait for confirmation", "info");
  
      // Send the actual transaction with the same parameters in the same order
      const receipt = await contract.methods.listProperty(
        formData.name,           // string: name
        formData.location,       // string: location
        formData.description,    // string: description
        formData.imageUrl || '', // string: imageUrl
        priceInWei,             // uint256: price in wei
        size,                    // uint256: size in square feet
        bedrooms,               // uint8: number of bedrooms
        bathrooms               // uint8: number of bathrooms
      ).send({
        from: accounts[selectedAccount],
        type: '0x0',
        gas: 3000000
      });
      
      console.log("Property listing receipt:", receipt);
      
      // Get the property ID from the event
      const propertyId = receipt.events.PropertyListed.returnValues.propertyId;
      
      // Get the property details
      const property = await contract.methods.getProperty(propertyId).call();
      const isOwner = await contract.methods.isOwner(propertyId).call({ 
        from: accounts[selectedAccount] 
      });
      
      const formattedProperty = {
        id: propertyId,
        name: property[0],
        location: property[1],
        description: property[2],
        imageUrl: property[3],
        price: web3.utils.fromWei(property[4], 'ether'),
        size: property[5],
        bedrooms: property[6],
        bathrooms: property[7],
        owner: property[8],
        isForSale: property[9],
        isCurrentUserOwner: isOwner
      };
      
      // Update both properties and userProperties
      setProperties(prev => [...prev, formattedProperty]);
      setUserProperties(prev => [...prev, formattedProperty]);
      
      // Clear transaction in progress
      setTransactionsInProgress(prev => {
        const updated = {...prev};
        delete updated[`list-${tempId}`];
        return updated;
      });
      
      setLoading(false);
      showNotification("Property listed successfully!", "success");
      
    } catch (error) {
      console.error("Error listing property:", error);
      showNotification(`Failed to list property: ${error.message}`, "error");
      setLoading(false);
      
      // Clear any transaction markers
      setTransactionsInProgress(prev => {
        const newState = {...prev};
        Object.keys(newState).forEach(key => {
          if (key.startsWith('list-')) {
            delete newState[key];
          }
        });
        return newState;
      });
    }
  };

  const handleAccountChange = (e) => {
    const accountIndex = parseInt(e.target.value);
    setSelectedAccount(accountIndex);
    
    // Reset state when changing accounts
    setProperties([]);
    setUserProperties([]);
    setLoading(true);
    
    // Reload properties for the new account
    if (contract) {
      // Re-setup event listeners with the new account
      setupEventListeners(contract);
      
      loadProperties(contract, accounts[accountIndex]).then(() => {
        setLoading(false);
        showNotification(`Switched to account: ${accounts[accountIndex].substring(0, 6)}...${accounts[accountIndex].substring(38)}`, "info");
      });
    }
  };

  const handleBuyProperty = async (propertyId, price) => {
    try {
      // Remove the window.confirm and use state to show custom dialog
      setConfirmDialog({
        show: true,
        propertyId,
        price,
      });
    } catch (error) {
      console.error("Error preparing purchase:", error);
      showNotification("Error preparing purchase", "error");
    }
  };

  const confirmPurchase = async () => {
    try {
      setLoading(true);
      const { propertyId, price } = confirmDialog;
      
      // First check if the user owns the property
      const isOwner = await contract.methods.isOwner(propertyId).call({ from: accounts[selectedAccount] });
      if (isOwner) {
        showNotification("You cannot buy your own property", "error");
        setLoading(false);
        return;
      }
      
      // Mark this transaction as in progress
      setTransactionsInProgress(prev => ({...prev, [`buy-${propertyId}`]: true}));
      
      const priceInWei = web3.utils.toWei(price.toString(), 'ether');
      
      showNotification("Processing purchase... Please wait for confirmation", "info");
  
      const receipt = await contract.methods.buyProperty(propertyId).send({
        from: accounts[selectedAccount],
        value: priceInWei,
        gas: 3000000,
        type: '0x0'
      });
      
      console.log("Property purchase receipt:", receipt);
      
      // Reload property data in case event listener missed it
      await loadProperties(contract, accounts[selectedAccount]);
      
      setLoading(false);
    } catch (error) {
      console.error("Error buying property:", error);
      
      // Extract the specific error message
      let errorMessage = error.message;
      if (error.message.includes("revert")) {
        errorMessage = error.message.split("revert")[1] || error.message;
      }
      
      showNotification(`Failed to buy property: ${errorMessage}`, "error");
      setLoading(false);
      
      // Clear transaction in progress
      setTransactionsInProgress(prev => {
        const updated = {...prev};
        delete updated[`buy-${confirmDialog.propertyId}`];
        return updated;
      });
    } finally {
      // Clear the confirmation dialog
      setConfirmDialog({ show: false, propertyId: null, price: null });
    }
  };

  const togglePropertyForSale = async (propertyId) => {
    try {
      setLoading(true);
      
      // Debug - Check ownership first
      const isOwner = await contract.methods.isOwner(propertyId).call({ 
        from: accounts[selectedAccount] 
      });
      
      console.log("Is selected account the owner?", isOwner);
      
      if (!isOwner) {
        showNotification("You are not the owner of this property", "error");
        setLoading(false);
        return;
      }
      
      // Mark this transaction as in progress
      setTransactionsInProgress(prev => ({...prev, [`toggle-${propertyId}`]: true}));
      
      showNotification("Updating property status... Please wait for confirmation", "info");
      
      const receipt = await contract.methods.toggleForSale(propertyId).send({
        from: accounts[selectedAccount],  // Use selectedAccount instead of accounts[0]
        type: '0x0',
        gas: 3000000
      });
      
      console.log("Toggle property sale status receipt:", receipt);
      
      // Manually update the property in the UI since there's no event for toggle
      await updatePropertyInUI(contract, propertyId);
      
      setLoading(false);
      
      const property = properties.find(p => p.id === propertyId);
      if (property) {
        const newStatus = !property.isForSale;
        showNotification(`Property is now ${newStatus ? 'for sale' : 'not for sale'}`, "success");
      }
    } catch (error) {
      console.error("Error toggling property for sale status:", error);
      
      // Extract the specific error message
      let errorMessage = error.message;
      if (error.message.includes("revert")) {
        errorMessage = error.message.split("revert")[1] || error.message;
      }
      
      showNotification(`Failed to update property status: ${errorMessage}`, "error");
      setLoading(false);
      
      // Clear transaction in progress
      setTransactionsInProgress(prev => {
        const updated = {...prev};
        delete updated[`toggle-${propertyId}`];
        return updated;
      });
    }
  };

  const updatePropertyPrice = async (propertyId, newPrice) => {
    try {
      setLoading(true);
      
      // First verify ownership with the selected account
      const isOwner = await contract.methods.isOwner(propertyId).call({ 
        from: accounts[selectedAccount] 
      });
      
      console.log("Is selected account the owner?", isOwner);
      
      if (!isOwner) {
        showNotification("You are not the owner of this property", "error");
        setLoading(false);
        return;
      }
      
      // Mark this transaction as in progress
      setTransactionsInProgress(prev => ({...prev, [`price-${propertyId}`]: true}));
      
      const priceInWei = web3.utils.toWei(newPrice.toString(), 'ether');
      
      showNotification("Updating property price... Please wait for confirmation", "info");
      
      const receipt = await contract.methods.updatePropertyPrice(propertyId, priceInWei).send({
        from: accounts[selectedAccount], // Use selectedAccount instead of accounts[0]
        type: '0x0',
        gas: 3000000
      });
      
      console.log("Update property price receipt:", receipt);
      
      // Manually update the property in the UI
      await updatePropertyInUI(contract, propertyId);
      
      setLoading(false);
      showNotification(`Property price updated to ${newPrice} ETH`, "success");
    } catch (error) {
      console.error("Error updating property price:", error);
      
      // Extract the specific error message
      let errorMessage = error.message;
      if (error.message.includes("revert")) {
        errorMessage = error.message.split("revert")[1] || error.message;
      }
      
      showNotification(`Failed to update property price: ${errorMessage}`, "error");
      setLoading(false);
      
      // Clear transaction in progress
      setTransactionsInProgress(prev => {
        const updated = {...prev};
        delete updated[`price-${propertyId}`];
        return updated;
      });
    }
  };

  if (!web3) {
    return <div className="loading-spinner">Loading Web3, accounts, and contract...</div>;
  }

  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      {/* Add Confirmation Dialog */}
      {confirmDialog.show && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <h2 className="dialog-title">Confirm Purchase</h2>
            <div className="dialog-body">
              Are you sure you want to buy this property for {confirmDialog.price} ETH?
            </div>
            <div className="dialog-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setConfirmDialog({ show: false, propertyId: null, price: null })}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={confirmPurchase}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      
      <header className="App-header">
        <div className="logo-section">
          <img src="/logo.svg" alt="DRealEstate" height="32" />
          <h1>DRealEstate</h1>
        </div>

        <nav className="nav-links">
          <button
            className={activeTab === 'marketplace' ? 'active' : ''}
            onClick={() => setActiveTab('marketplace')}
          >
            Marketplace
          </button>
          <button
            className={activeTab === 'my-properties' ? 'active' : ''}
            onClick={() => setActiveTab('my-properties')}
          >
            My Properties
          </button>
          <button
            className={activeTab === 'list-property' ? 'active' : ''}
            onClick={() => setActiveTab('list-property')}
          >
            List Property
          </button>
        </nav>

        <div className="wallet-section">
          <div className="account-display">
            ACC {selectedAccount + 1}
          </div>
          <select 
            onChange={handleAccountChange} 
            value={selectedAccount}
            className="account-select"
          >
            {accounts.map((account, index) => (
              <option key={account} value={index} className="account-option">
                Account {index + 1} • {`${account.substring(0, 6)}...${account.substring(38)}`}
              </option>
            ))}
          </select>
          <div className="dropdown-arrow">▼</div>
        </div>
      </header>

      <main>
        {activeTab === 'marketplace' && (
          <>
            <h2 className="section-title">Featured Properties</h2>

            <PropertyList
              properties={properties.filter(p => 
                p.isForSale && !p.isCurrentUserOwner
              )}
              onBuy={handleBuyProperty}
            />

            <div className="feature-cards">
              <div className="feature-card">
                <div className="icon">🏠</div>
                <h3>Verified Properties</h3>
                <p>All property listings are verified on the blockchain</p>
              </div>
              <div className="feature-card">
                <div className="icon">🔒</div>
                <h3>Secure Payments</h3>
                <p>Pay with cryptocurrency securely and instantly</p>
              </div>
              <div className="feature-card">
                <div className="icon">⚡</div>
                <h3>Instant Transfer</h3>
                <p>Property ownership transfers immediately</p>
              </div>
            </div>
          </>
        )}

        <div className="container">
          {loading ? (
            <div className="loading-spinner">
              <LoadingSpinner message="Processing transaction..." />
            </div>
          ) : (
            <>
              {activeTab === 'my-properties' && (
                <UserProperties
                  properties={properties.filter(p => 
                    p.isCurrentUserOwner
                  )}
                  onToggleForSale={togglePropertyForSale}
                  onUpdatePrice={updatePropertyPrice}
                />
              )}
              {activeTab === 'list-property' && (
                <PropertyForm onSubmit={handleListProperty} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;