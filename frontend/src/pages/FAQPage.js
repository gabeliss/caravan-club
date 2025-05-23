import React, { useState } from 'react';
import './../styles/faq.css';
import { FaMinus, FaPlus } from 'react-icons/fa';

function FAQPage() {
    const [showAnswers, setShowAnswers] = useState([false, false, false, false, false]);

    const toggleAnswer = (index) => {
        const newShowAnswers = [...showAnswers];
        newShowAnswers[index] = !newShowAnswers[index];
        setShowAnswers(newShowAnswers);
    };

    return (
        <div className='faq-page'>
            <h1>
                {['Frequently', 'Asked', 'Questions:'].join('\n')}
            </h1>
            
            <div className='faq-questions-container'>
                {/* Question 1 */}
                <div className='faq-questions' onClick={() => toggleAnswer(0)}>
                    <div className='faq-question'>
                        <p>Why choose Caravan Club curated road trips?</p>
                        <div className='faq-toggle'>
                            {showAnswers[0] ? <FaMinus /> : <FaPlus />}
                        </div>
                    </div>
                    {showAnswers[0] && (
                        <div className='faq-answer'>
                            <p>
                                Our curated road trips are meticulously designed by seasoned travel experts who've 
                                vetted each route to ensure you experience the absolute best of every destination.
                            </p>
                        </div>
                    )}
                </div>

                {/* Question 2 */}
                <div className='faq-questions' onClick={() => toggleAnswer(1)}>
                    <div className='faq-question'>
                        <p>How does Caravan Club personalize experiences for travelers?</p>
                        <div className='faq-toggle'>
                            {showAnswers[1] ? <FaMinus /> : <FaPlus />}
                        </div>
                    </div>
                    {showAnswers[1] && (
                        <div className='faq-answer'>
                            <p>
                                We tailor experiences based on your preferences, whether it's remote wilderness 
                                camping or glamorous glamping with added comforts and amenities. We make sure to 
                                accommodate based on length, ages, and experiences.
                            </p>
                        </div>
                    )}
                </div>

                {/* Question 3 */}
                <div className='faq-questions' onClick={() => toggleAnswer(2)}>
                    <div className='faq-question'>
                        <p>Are these road trips suitable for all types of travelers?</p>
                        <div className='faq-toggle'>
                            {showAnswers[2] ? <FaMinus /> : <FaPlus />}
                        </div>
                    </div>
                    {showAnswers[2] && (
                        <div className='faq-answer'>
                            <p>
                                Absolutely, our curated road trips are designed to cater to various preferences and 
                                travel styles, ensuring there's something memorable for everyone, whether you're new 
                                to camping or a backcountry expert.
                            </p>
                        </div>
                    )}
                </div>

                {/* Question 4 */}
                <div className='faq-questions' onClick={() => toggleAnswer(3)}>
                    <div className='faq-question'>
                        <p>How do you ensure a seamless experience throughout the road trip?</p>
                        <div className='faq-toggle'>
                            {showAnswers[3] ? <FaMinus /> : <FaPlus />}
                        </div>
                    </div>
                    {showAnswers[3] && (
                        <div className='faq-answer'>
                            <p>
                                We provide detailed guidance, comprehensive maps, insider tips, and support 
                                throughout your journey, ensuring a smooth and enjoyable travel experience.
                            </p>
                        </div>
                    )}
                </div>

                {/* Question 5 */}
                <div className='faq-questions' onClick={() => toggleAnswer(4)}>
                    <div className='faq-question'>
                        <p>How do I get started with one of your curated road trips?</p>
                        <div className='faq-toggle'>
                            {showAnswers[4] ? <FaMinus /> : <FaPlus />}
                        </div>
                    </div>
                    {showAnswers[4] && (
                        <div className='faq-answer'>
                            <p>
                                Simply browse through our list of road trips and choose one that captures your 
                                interest. Once you've selected, pick your travel dates, and we'll start tailoring 
                                the trip to your preferences. Our team is here to assist you in curating the ideal 
                                road trip that suits your adventure aspirations.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FAQPage;