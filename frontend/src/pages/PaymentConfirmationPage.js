import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './../styles/payment-confirmation.css';

function PaymentConfirmationPage() {
    const { state } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!state) {
            navigate('/');
            return;
        }
    }, [state, navigate]);

    if (!state) return null;

    const { orderNumber, allPaymentsSuccessful, confirmedSites, pendingSites } = state;

    return (
        <div className='payment-confirmation-page'>
            <div className='order-number'>Order Number: {orderNumber}</div>
            
            {allPaymentsSuccessful ? (
                <>
                    <h1>Success! All of your selected camp sites have been booked. We can't wait for you to start your Caravan!</h1>
                    <p className='confirmation-message'>
                        You will receive a confirmation email including the details of your trip. 
                        If you have any questions or need additional support, feel free to contact us at caravantripplan@gmail.com.
                    </p>
                </>
            ) : (
                <>
                    <h1>We're working to finalize your reservations. A few details are still being confirmed to ensure everything is perfect. We'll send you an update as soon as possible.</h1>
                    
                    {confirmedSites.length > 0 && (
                        <div className='sites-section'>
                            <h3>Confirmed Sites:</h3>
                            <p>{confirmedSites.join(', ')}</p>
                        </div>
                    )}
                    
                    {pendingSites.length > 0 && (
                        <div className='sites-section'>
                            <h3>Pending Confirmation:</h3>
                            <p>{pendingSites.join(', ')}</p>
                        </div>
                    )}
                    
                    <p className='confirmation-message'>
                        No additional action is needed on your end. If you have any questions or need additional support, 
                        feel free to contact us at caravantripplan@gmail.com.
                    </p>
                </>
            )}
        </div>
    );
}

export default PaymentConfirmationPage;
