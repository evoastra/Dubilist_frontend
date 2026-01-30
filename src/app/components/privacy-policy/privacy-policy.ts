import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-policy.html',
  styleUrls: ['./privacy-policy.css']
})
export class PrivacyPolicyComponent {
  sections = [
    {
      id: 'intro',
      title: 'Introduction',
      content: 'At Dubilist, we value your privacy and are committed to safeguarding your personal information. This Privacy Policy explains how we collect, use, store, and protect your personal data when you access or use our website and mobile applications (collectively referred to as the “Platform”). It also outlines your rights and the protections provided under applicable data protection laws.',
      subText: 'By accessing or using the Platform, you acknowledge and agree to the handling of your personal data as described in this Privacy Policy. This policy explains:',
      type: 'list',
      items: [
        'How you can contact us',
        'The types of personal data we collect',
        'How and why we use your personal data',
        'How we protect your information',
        'How long we retain your data',
        'Your rights regarding your personal data',
        'Our marketing practices',
        'Our approach to minors',
        'Links to third-party platforms',
        'Updates to this Privacy Policy'
      ]
    },
    {
      id: 'updates',
      title: 'Updates to This Policy',
      content: 'We may update this Privacy Policy from time to time, with or without prior notice. Any revised version will be published on this page and will take effect immediately upon posting. If this Privacy Policy is made available in multiple languages, the English version will prevail in the event of any inconsistency.',
      type: 'text'
    },
    {
      id: 'contact',
      title: 'Contact Information',
      content: 'If you have questions, concerns, or requests regarding this Privacy Policy or how your personal data is handled, you can reach us at:',
      email: 'privacy@dubilist.com',
      type: 'contact'
    },
    {
      id: 'collection',
      title: 'Personal Data We Collect',
      content: 'Personal Data refers to information that can directly or indirectly identify an individual. This does not include information that has been permanently anonymized. However, it does include pseudonymized data that could identify an individual when combined with additional information. We collect personal data that you voluntarily provide to us when you register, interact with the Platform, or communicate with us.',
      type: 'text'
    },
    {
      id: 'aggregated',
      title: 'Aggregated and Statistical Data',
      content: 'We may collect and use aggregated data, such as usage statistics or demographic insights, for analytical and operational purposes. Although this data may originate from personal data, it does not identify you once aggregated. If aggregated data is later combined with personal data in a way that identifies you, it will be treated as personal data under this policy.',
      type: 'text'
    },
    {
      id: 'sensitive',
      title: 'Sensitive Personal Data',
      content: 'We do not intentionally collect sensitive categories of personal data, including but not limited to information about race, religion, political opinions, health, biometric data, or criminal records. You are strongly advised not to share such information with us or with other users through the Platform. If you choose to do so, you acknowledge and consent to our processing of that data in accordance with this Privacy Policy.',
      type: 'text'
    },
    {
      id: 'not-provided',
      title: 'When Personal Data Is Not Provided',
      content: 'Providing personal data is optional. However, certain information may be required to create an account, access features, or comply with legal obligations. If you choose not to provide required information, we may be unable to offer you full access to the Platform or specific services.',
      type: 'text'
    },
    {
      id: 'usage',
      title: 'How We Use Your Personal Data',
      content: 'We use your personal data only for legitimate purposes that are clearly communicated to you. These purposes include operating the Platform, providing services, improving user experience, complying with legal obligations, and communicating with you. If we need to use your personal data for a new purpose that is not compatible with the original one, we will update this Privacy Policy and explain the legal basis for such use.',
      type: 'text'
    },
    {
      id: 'legal',
      title: 'Legal Grounds for Processing',
      content: 'We process your personal data only when permitted by applicable law. Common legal bases include:',
      type: 'list',
      items: [
        'Contractual necessity: Processing required to provide services or fulfill agreements with you',
        'Legal compliance: Processing required to meet legal or regulatory obligations',
        'Consent: Processing based on your explicit permission for a specific purpose'
      ]
    },
    {
      id: 'transfers',
      title: 'International Data Transfers',
      content: 'Your personal data may be transferred to and processed in countries outside your country of residence. Where such transfers occur, we ensure appropriate safeguards are in place to comply with applicable data protection laws.',
      type: 'text'
    },
    {
      id: 'security',
      title: 'Data Security',
      content: 'We implement appropriate technical and organizational measures to protect your personal data from unauthorized access, loss, misuse, or alteration. Access to personal data is restricted to authorized personnel who require it for legitimate business purposes and who are bound by confidentiality obligations. We also maintain procedures to respond promptly to any actual or suspected data breach and to work with relevant authorities when required.',
      type: 'text'
    },
    {
      id: 'retention',
      title: 'Data Retention',
      content: 'We retain personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy or to comply with legal requirements. In some cases, we may anonymize your data so it can no longer be associated with you. Anonymized data may be retained indefinitely. Our data retention practices are reviewed regularly.',
      type: 'text'
    },
    {
      id: 'rights',
      title: 'Your Rights',
      content: 'Depending on applicable laws, you may have the right to:',
      type: 'list',
      items: [
        'Access your personal data',
        'Request correction of inaccurate or incomplete data',
        'Request deletion of your personal data',
        'Object to certain types of processing',
        'Request transfer of your data to another party',
        'Withdraw consent where processing is based on consent'
      ],
      footerText: 'Some rights may apply only in specific circumstances.'
    },
    {
      id: 'exercise',
      title: 'Exercising Your Rights',
      content: 'To exercise any of your rights, please contact us using the details provided above. We may request additional information to verify your identity before processing your request. We aim to respond within one month. If a request is complex or excessive, we may require additional time or charge a reasonable fee where permitted by law.',
      type: 'text'
    },
    {
      id: 'complaints',
      title: 'Complaints',
      content: 'If you have concerns about how your personal data is handled, please contact us first. We will investigate and respond promptly. If you are not satisfied with our response, you may have the right to lodge a complaint with the data protection authority in your jurisdiction.',
      type: 'text'
    },
    {
      id: 'marketing',
      title: 'Marketing Communications',
      content: 'You may opt out of marketing communications at any time by adjusting your preferences in your account settings or by using the unsubscribe link included in our marketing emails.',
      type: 'text'
    },
    {
      id: 'minors',
      title: 'Minors',
      content: 'The Platform is not intended for use by minors. We do not actively verify users’ ages. If you believe that a minor is using the Platform in violation of this policy, please contact us so we can take appropriate action.',
      type: 'text'
    },
    {
      id: 'links',
      title: 'Third-Party Links',
      content: 'The Platform may contain links to external websites or applications that are not operated by us. We are not responsible for the privacy practices of those third parties. We recommend reviewing their privacy policies before providing any personal data.',
      type: 'text'
    },
    {
      id: 'changes',
      title: 'Policy Changes',
      content: 'We reserve the right to modify this Privacy Policy at any time. Updated versions will be posted on this page and may also be communicated to you through other channels when appropriate.',
      type: 'text'
    }
  ];

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}