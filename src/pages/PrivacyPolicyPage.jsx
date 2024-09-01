import React from 'react'

const PrivacyPolicyPage = () => {
  return (
    <div className="flex flex-col items-center justify-center p-5 mt-12">
      <div className="max-w-3xl w-full ml-[-25%]">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="mb-4"><strong>Effective Date:</strong> 01/09/2024</p>

        <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
        <p className="mb-4">Welcome to A.I Agency Jobs. We are committed to protecting your personal information and respecting your privacy. This Privacy Policy outlines how we collect, use, store, and protect your information when you use our web application.</p>

        <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
        <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
        <p className="mb-4">When you use A.I Agency Jobs, we may collect the following personal information:</p>
        <ul className="list-disc list-inside mb-4">
          <li className="mb-2"><strong>Basic Profile Information:</strong> Such as your name, email address, and profile picture, as provided by Google during the OAuth authentication process.</li>
          <li className="mb-2"><strong>Job-Related Information:</strong> Such as your resume, employment history, and educational background, if you choose to provide them.</li>
        </ul>

        <h3 className="text-xl font-semibold mb-2">Non-Personal Information</h3>
        <p className="mb-4">We may also collect non-personal information that does not directly identify you, such as:</p>
        <ul className="list-disc list-inside mb-4">
          <li className="mb-2"><strong>Browser Information:</strong> Including your browser type, version, and language.</li>
          <li className="mb-2"><strong>Device Information:</strong> Including device type, operating system, and IP address.</li>
          <li className="mb-2"><strong>Usage Data:</strong> Including pages viewed, links clicked, and other actions taken on our site.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
        <p className="mb-4">We use the information we collect for the following purposes:</p>
        <ul className="list-disc list-inside mb-4">
          <li className="mb-2"><strong>Providing Services:</strong> To facilitate job searching, job applications, and connecting you with potential employers.</li>
          <li className="mb-2"><strong>Improving Our Platform:</strong> To analyze user behavior, improve site performance, and enhance the overall user experience.</li>
          <li className="mb-2"><strong>Communications:</strong> To send you updates, notifications, and other relevant communications related to your use of A.I Agency Jobs.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3">4. Authentication and Security</h2>
        <h3 className="text-xl font-semibold mb-2">Google OAuth</h3>
        <p className="mb-4">A.I Agency Jobs uses Google OAuth for user authentication. We do not store or manage your passwords. When you sign in using Google, we only receive basic profile information that you allow Google to share with us.</p>

        <h3 className="text-xl font-semibold mb-2">MongoDB Storage</h3>
        <p className="mb-4">We use MongoDB to store your personal information securely. We implement industry-standard security measures to protect your data from unauthorized access, alteration, disclosure, or destruction.</p>

        <h2 className="text-2xl font-semibold mb-3">5. Sharing of Information</h2>
        <p className="mb-4">We may share your information in the following circumstances:</p>
        <ul className="list-disc list-inside mb-4">
          <li className="mb-2"><strong>With Employers:</strong> Your profile information may be shared with employers or recruiters who post job listings on our platform.</li>
          <li className="mb-2"><strong>Service Providers:</strong> We may share your information with third-party service providers who help us operate the platform, such as hosting and database management services.</li>
          <li className="mb-2"><strong>Legal Compliance:</strong> We may disclose your information if required by law or in response to legal requests such as subpoenas or court orders.</li>
          <li className="mb-2"><strong>Business Transfers:</strong> If A.I Agency Jobs is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3">6. Cookies and Tracking Technologies</h2>
        <p className="mb-4">A.I Agency Jobs uses cookies and similar tracking technologies to:</p>
        <ul className="list-disc list-inside mb-4">
          <li className="mb-2"><strong>Personalize your experience</strong> on the platform.</li>
          <li className="mb-2"><strong>Analyze site traffic</strong> and usage patterns to improve our services.</li>
          <li className="mb-2"><strong>Remember your preferences</strong> and login sessions.</li>
        </ul>
        <p className="mb-4">You can manage your cookie preferences through your browser settings.</p>

        <h2 className="text-2xl font-semibold mb-3">7. Data Retention</h2>
        <p className="mb-4">We retain your personal information for as long as your account is active or as needed to provide you with our services. We may also retain and use your information to comply with our legal obligations, resolve disputes, and enforce our agreements.</p>

        <h2 className="text-2xl font-semibold mb-3">8. Your Rights</h2>
        <p className="mb-4">You have the following rights regarding your personal information:</p>
        <ul className="list-disc list-inside mb-4">
          <li className="mb-2"><strong>Access:</strong> You can request access to the personal information we hold about you.</li>
          <li className="mb-2"><strong>Correction:</strong> You can request corrections to any inaccuracies in your personal information.</li>
          <li className="mb-2"><strong>Deletion:</strong> You can request the deletion of your personal information. Note that some information may need to be retained for legal reasons.</li>
          <li className="mb-2"><strong>Withdrawal of Consent:</strong> You can withdraw your consent for data processing at any time by discontinuing the use of A.I Agency Jobs and deleting your account.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3">9. International Data Transfers</h2>
        <p className="mb-4">Your information may be transferred to and processed in countries outside of your country of residence. We take steps to ensure that your information receives an adequate level of protection in accordance with applicable data protection laws.</p>

        <h2 className="text-2xl font-semibold mb-3">10. Children's Privacy</h2>
        <p className="mb-4">A.I Agency Jobs is not intended for children under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that we have collected such information, we will take steps to delete it.</p>

        <h2 className="text-2xl font-semibold mb-3">11. Changes to This Privacy Policy</h2>
        <p className="mb-4">We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new Privacy Policy on our website and updating the "Effective Date" at the top of this page.</p>

        <h2 className="text-2xl font-semibold mb-3">12. Contact Us</h2>
        <p className="mb-4">If you have any questions, concerns, or requests regarding your privacy or this Privacy Policy, please contact us at:</p>
        <p className="mb-4"><strong>Email:</strong> taine.jarvis@gmail.com <br />
        <strong>Address:</strong> 21D Sunnymead Road, Auckland, New Zealand</p>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage