import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
  SafeAreaView,
} from 'react-native';

interface HowToScreenProps {
  visible: boolean;
  onClose: () => void;
}

type Section = 'basics' | 'tips' | 'banks' | 'coins' | 'tools';

interface GuideSection {
  key: Section;
  title: string;
  icon: string;
  content: React.ReactNode;
}

export const HowToScreen: React.FC<HowToScreenProps> = ({
  visible,
  onClose,
}) => {
  const [currentSection, setCurrentSection] = useState<Section>('basics');

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const sections: GuideSection[] = [
    {
      key: 'basics',
      title: 'Getting Started',
      icon: '🎯',
      content: (
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>🎯 Coin Roll Hunting Basics</Text>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>What is Coin Roll Hunting?</Text>
            <Text style={styles.tipText}>
              Coin roll hunting (CRH) is the hobby of searching through rolls of coins obtained from banks 
              to find valuable, rare, or collectible coins - especially silver coins minted before 1965.
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Why Hunt for Silver?</Text>
            <Text style={styles.tipText}>
              • Pre-1965 dimes, quarters, and half dollars contain 90% silver{'\n'}
              • 1965-1970 half dollars contain 40% silver{'\n'}
              • Silver coins are worth much more than face value{'\n'}
              • It's like treasure hunting with guaranteed fun!
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Getting Started</Text>
            <Text style={styles.tipText}>
              1. Visit your local bank and ask for coin rolls{'\n'}
              2. Start with dimes or quarters (easier to search){'\n'}
              3. Search through each coin looking for silver{'\n'}
              4. Keep silver coins, return the rest to a different bank{'\n'}
              5. Track your finds with Silver Edge!
            </Text>
          </View>

          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Important Rules</Text>
            <Text style={styles.warningText}>
              • Always return searched coins to a DIFFERENT bank{'\n'}
              • Be polite and respectful to bank staff{'\n'}
              • Don't take more than you can search reasonably{'\n'}
              • Build relationships with multiple banks
            </Text>
          </View>
        </View>
      ),
    },
    {
      key: 'tips',
      title: 'Pro Tips',
      icon: '💡',
      content: (
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>💡 Pro Hunter Tips</Text>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Best Times to Hunt</Text>
            <Text style={styles.tipText}>
              • Monday mornings (weekend deposits){'\n'}
              • After holidays (people cash in old coins){'\n'}
              • End of month (businesses deposit more coins){'\n'}
              • Ask when they get coin deliveries
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>What to Look For</Text>
            <Text style={styles.tipText}>
              🥈 <Text style={styles.boldText}>Silver Coins:</Text>{'\n'}
              • 1964 and earlier dimes, quarters, half dollars{'\n'}
              • 1965-1970 half dollars (40% silver){'\n'}
              • Look for the distinctive silver edge{'\n\n'}
              
              💎 <Text style={styles.boldText}>Other Valuable Finds:</Text>{'\n'}
              • Wheat pennies (1909-1958){'\n'}
              • Buffalo nickels (1913-1938){'\n'}
              • Error coins and varieties{'\n'}
              • Foreign coins
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Efficiency Tips</Text>
            <Text style={styles.tipText}>
              • Learn the silver "ring" sound{'\n'}
              • Check edges first for silver{'\n'}
              • Use good lighting{'\n'}
              • Take breaks to avoid eye strain{'\n'}
              • Keep a magnifying glass handy
            </Text>
          </View>

          <View style={styles.successCard}>
            <Text style={styles.successTitle}>🏆 Success Metrics</Text>
            <Text style={styles.successText}>
              • 1 silver per $100 searched = Great day!{'\n'}
              • 1 silver per $500 searched = Average{'\n'}
              • Some hunters go months without finds{'\n'}
              • It's about the journey, not just the destination!
            </Text>
          </View>
        </View>
      ),
    },
    {
      key: 'banks',
      title: 'Bank Strategy',
      icon: '🏦',
      content: (
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>🏦 Bank Relationship Strategy</Text>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Building Bank Relationships</Text>
            <Text style={styles.tipText}>
              • Introduce yourself to tellers{'\n'}
              • Be friendly and respectful{'\n'}
              • Ask about their coin ordering schedule{'\n'}
              • Tip: Bring coffee or donuts occasionally{'\n'}
              • Remember their names and ask about their day
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Best Banks for CRH</Text>
            <Text style={styles.tipText}>
              ⭐ <Text style={styles.boldText}>Excellent:</Text> Credit Unions, smaller regional banks{'\n'}
              ✅ <Text style={styles.boldText}>Good:</Text> Chase, Wells Fargo, Bank of America{'\n'}
              ⚠️ <Text style={styles.boldText}>Challenging:</Text> Some banks charge fees{'\n\n'}
              
              <Text style={styles.boldText}>Why smaller banks are better:</Text>{'\n'}
              • More personal service{'\n'}
              • Often no fees for coin orders{'\n'}
              • Tellers more willing to help{'\n'}
              • Less competition from other hunters
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>The Pickup & Dump Strategy</Text>
            <Text style={styles.tipText}>
              📥 <Text style={styles.boldText}>Pickup Banks:</Text> Where you get fresh rolls{'\n'}
              📤 <Text style={styles.boldText}>Dump Banks:</Text> Where you return searched coins{'\n\n'}
              
              • Never dump at your pickup bank!{'\n'}
              • Maintain 2-3 pickup banks{'\n'}
              • Have 1-2 reliable dump banks{'\n'}
              • Rotate to avoid oversaturating any location
            </Text>
          </View>

          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>❌ What NOT to Do</Text>
            <Text style={styles.warningText}>
              • Don't dump at pickup banks{'\n'}
              • Don't be pushy or demanding{'\n'}
              • Don't take all their coins{'\n'}
              • Don't hunt during busy times{'\n'}
              • Don't argue about fees
            </Text>
          </View>
        </View>
      ),
    },
    {
      key: 'coins',
      title: 'Coin Guide',
      icon: '🪙',
      content: (
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>🪙 Coin Identification Guide</Text>
          
          <View style={styles.coinCard}>
            <Text style={styles.coinTitle}>🥈 Silver Dimes (1964 & Earlier)</Text>
            <Text style={styles.coinText}>
              <Text style={styles.boldText}>What to look for:</Text>{'\n'}
              • Date 1964 or earlier{'\n'}
              • Silver edge (no copper stripe){'\n'}
              • Distinctive "ring" when dropped{'\n\n'}
              
              <Text style={styles.boldText}>Key dates:</Text>{'\n'}
              • 1916-D Mercury (very valuable){'\n'}
              • 1942/1 Mercury overdate{'\n'}
              • Any Barber dimes (1892-1916)
            </Text>
          </View>

          <View style={styles.coinCard}>
            <Text style={styles.coinTitle}>🥈 Silver Quarters (1964 & Earlier)</Text>
            <Text style={styles.coinText}>
              <Text style={styles.boldText}>What to look for:</Text>{'\n'}
              • Date 1964 or earlier{'\n'}
              • Silver edge (no copper stripe){'\n'}
              • Heavier feel than modern quarters{'\n\n'}
              
              <Text style={styles.boldText}>Key dates:</Text>{'\n'}
              • 1932-D & 1932-S Washington{'\n'}
              • Any Standing Liberty (1916-1930){'\n'}
              • Any Barber quarters (1892-1916)
            </Text>
          </View>

          <View style={styles.coinCard}>
            <Text style={styles.coinTitle}>🥈 Silver Half Dollars</Text>
            <Text style={styles.coinText}>
              <Text style={styles.boldText}>90% Silver (1964 & earlier):</Text>{'\n'}
              • Walking Liberty (1916-1947){'\n'}
              • Franklin (1948-1963){'\n'}
              • Kennedy (1964 only){'\n\n'}
              
              <Text style={styles.boldText}>40% Silver (1965-1970):</Text>{'\n'}
              • Kennedy half dollars{'\n'}
              • Still valuable, but less silver content
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🔍 Quick Identification Tips</Text>
            <Text style={styles.tipText}>
              • <Text style={styles.boldText}>Edge test:</Text> Silver coins have solid silver edges{'\n'}
              • <Text style={styles.boldText}>Sound test:</Text> Silver rings, clad coins thud{'\n'}
              • <Text style={styles.boldText}>Weight test:</Text> Silver coins feel heavier{'\n'}
              • <Text style={styles.boldText}>Color test:</Text> Silver has distinctive luster
            </Text>
          </View>
        </View>
      ),
    },
    {
      key: 'tools',
      title: 'Tools & Resources',
      icon: '🛠️',
      content: (
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>🛠️ Essential Tools & Resources</Text>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Basic Equipment</Text>
            <Text style={styles.tipText}>
              📱 <Text style={styles.boldText}>Silver Edge App:</Text> Track your hunts!{'\n'}
              🔍 <Text style={styles.boldText}>Magnifying glass:</Text> For detailed inspection{'\n'}
              💡 <Text style={styles.boldText}>Good lighting:</Text> LED desk lamp{'\n'}
              📦 <Text style={styles.boldText}>Storage:</Text> Coin tubes, folders{'\n'}
              ⚖️ <Text style={styles.boldText}>Scale:</Text> For verifying silver weight{'\n'}
              🧤 <Text style={styles.boldText}>Gloves:</Text> Keep coins clean
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Useful Apps & Websites</Text>
            <Text style={styles.tipText}>
              📱 <Text style={styles.boldText}>Silver Edge:</Text> Your hunt tracker{'\n'}
              💰 <Text style={styles.boldText}>Coinflation.com:</Text> Current silver values{'\n'}
              📚 <Text style={styles.boldText}>PCGS CoinFacts:</Text> Coin identification{'\n'}
              🏦 <Text style={styles.boldText}>Bank websites:</Text> Find locations{'\n'}
              📊 <Text style={styles.boldText}>Reddit r/CRH:</Text> Community tips
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Record Keeping</Text>
            <Text style={styles.tipText}>
              📝 <Text style={styles.boldText}>Track everything:</Text>{'\n'}
              • Date and bank of each hunt{'\n'}
              • Number of rolls searched{'\n'}
              • Silver coins found{'\n'}
              • Total coins checked{'\n'}
              • Success rate over time{'\n\n'}
              
              <Text style={styles.boldText}>Why track?</Text>{'\n'}
              • Identify best banks and times{'\n'}
              • Calculate your success rate{'\n'}
              • Tax purposes (if selling silver){'\n'}
              • Personal satisfaction and goals
            </Text>
          </View>

          <View style={styles.successCard}>
            <Text style={styles.successTitle}>🎯 Setting Goals</Text>
            <Text style={styles.successText}>
              • Start small: 1-2 rolls per week{'\n'}
              • Set monthly silver targets{'\n'}
              • Track your best finds{'\n'}
              • Celebrate small victories{'\n'}
              • Join online CRH communities{'\n'}
              • Share your success stories!
            </Text>
          </View>
        </View>
      ),
    },
  ];

  const renderSectionSelector = () => (
    <View style={styles.sectionSelector}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.key}
            style={[
              styles.sectionButton,
              currentSection === section.key && styles.sectionButtonActive
            ]}
            onPress={() => setCurrentSection(section.key)}
          >
            <Text style={styles.sectionButtonIcon}>{section.icon}</Text>
            <Text style={[
              styles.sectionButtonText,
              currentSection === section.key && styles.sectionButtonTextActive
            ]}>
              {section.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const currentSectionData = sections.find(s => s.key === currentSection);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📚 Hunter's Guide</Text>
          <View style={styles.placeholder} />
        </View>

        {renderSectionSelector()}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {currentSectionData?.content}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  closeButtonText: {
    color: '#E74C3C',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  placeholder: {
    width: 60,
  },
  sectionSelector: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginRight: 12,
    minWidth: 80,
  },
  sectionButtonActive: {
    backgroundColor: '#3498DB',
  },
  sectionButtonIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  sectionButtonText: {
    fontSize: 11,
    color: '#7F8C8D',
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  sectionContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#34495E',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  warningCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#C0392B',
    lineHeight: 20,
  },
  successCard: {
    backgroundColor: '#F0FFF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  successTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#229954',
    lineHeight: 20,
  },
  coinCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
  },
  coinTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D68910',
    marginBottom: 8,
  },
  coinText: {
    fontSize: 14,
    color: '#B7950B',
    lineHeight: 20,
  },
});
