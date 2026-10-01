package com.ezsplit.config;

import com.ezsplit.model.*;
import com.ezsplit.model.enums.RequestStatus;
import com.ezsplit.model.enums.SplitType;
import com.ezsplit.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("Initializing EzSplit database with realistic demo data...");

            // Seed Users
            User manoj = new User("google_manoj_1", "Manoj Kumar", "manoj@gmail.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=Manoj");
            User rahul = new User("google_rahul_2", "Rahul Sharma", "rahul@gmail.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul");
            User aman = new User("google_aman_3", "Aman Verma", "aman@gmail.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=Aman");
            User rohit = new User("google_rohit_4", "Rohit Patel", "rohit@gmail.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohit");

            List<User> savedUsers = userRepository.saveAll(Arrays.asList(manoj, rahul, aman, rohit));
            manoj = savedUsers.get(0);
            rahul = savedUsers.get(1);
            aman = savedUsers.get(2);
            rohit = savedUsers.get(3);

            // Establish Friendships
            manoj.setFriendIds(Arrays.asList(rahul.getId(), aman.getId(), rohit.getId()));
            rahul.setFriendIds(Arrays.asList(manoj.getId(), aman.getId(), rohit.getId()));
            aman.setFriendIds(Arrays.asList(manoj.getId(), rahul.getId(), rohit.getId()));
            rohit.setFriendIds(Arrays.asList(manoj.getId(), rahul.getId(), aman.getId()));
            userRepository.saveAll(Arrays.asList(manoj, rahul, aman, rohit));

            // Seed Friend Requests (Accepted status)
            FriendRequest fr1 = new FriendRequest(manoj.getId(), rahul.getId());
            fr1.setStatus(RequestStatus.ACCEPTED);
            friendRequestRepository.save(fr1);

            FriendRequest fr2 = new FriendRequest(manoj.getId(), aman.getId());
            fr2.setStatus(RequestStatus.ACCEPTED);
            friendRequestRepository.save(fr2);

            // Seed Group: "Goa Trip 2026"
            Group goaTrip = new Group(
                    "Goa Trip 2026",
                    "4 day trip with friends to Goa beach resorts",
                    "Trip",
                    manoj.getId(),
                    Arrays.asList(manoj.getId(), rahul.getId(), aman.getId(), rohit.getId())
            );
            Group savedGroup = groupRepository.save(goaTrip);

            // Seed Group: "Hostel Room 402"
            Group hostelGroup = new Group(
                    "Hostel Room 402",
                    "Shared apartment expenses and utilities",
                    "Home",
                    manoj.getId(),
                    Arrays.asList(manoj.getId(), aman.getId())
            );
            groupRepository.save(hostelGroup);

            // Expense 1: Dinner paid by Manoj (₹2400 split equal among 4 = ₹600 each)
            Expense exp1 = new Expense();
            exp1.setGroupId(savedGroup.getId());
            exp1.setDescription("Goa Beach Shack Dinner");
            exp1.setAmount(new BigDecimal("2400.00"));
            exp1.setPaidBy(manoj.getId());
            exp1.setSplitType(SplitType.EQUAL);
            exp1.setCategory("Food");
            exp1.setCreatedBy(manoj.getId());
            exp1.setParticipants(Arrays.asList(
                    new ExpenseSplit(manoj.getId(), new BigDecimal("600.00"), 25.0),
                    new ExpenseSplit(rahul.getId(), new BigDecimal("600.00"), 25.0),
                    new ExpenseSplit(aman.getId(), new BigDecimal("600.00"), 25.0),
                    new ExpenseSplit(rohit.getId(), new BigDecimal("600.00"), 25.0)
            ));
            expenseRepository.save(exp1);

            // Expense 2: Resort Booking paid by Rahul (₹12000 split equal among 4 = ₹3000 each)
            Expense exp2 = new Expense();
            exp2.setGroupId(savedGroup.getId());
            exp2.setDescription("Goa Beach Resort Stay");
            exp2.setAmount(new BigDecimal("12000.00"));
            exp2.setPaidBy(rahul.getId());
            exp2.setSplitType(SplitType.EQUAL);
            exp2.setCategory("Travel");
            exp2.setCreatedBy(rahul.getId());
            exp2.setParticipants(Arrays.asList(
                    new ExpenseSplit(manoj.getId(), new BigDecimal("3000.00"), 25.0),
                    new ExpenseSplit(rahul.getId(), new BigDecimal("3000.00"), 25.0),
                    new ExpenseSplit(aman.getId(), new BigDecimal("3000.00"), 25.0),
                    new ExpenseSplit(rohit.getId(), new BigDecimal("3000.00"), 25.0)
            ));
            expenseRepository.save(exp2);

            // Expense 3: Car Rental paid by Manoj (₹4050 split equal among 3 = ₹1350 each)
            Expense exp3 = new Expense();
            exp3.setGroupId(savedGroup.getId());
            exp3.setDescription("Self Drive Car Rental");
            exp3.setAmount(new BigDecimal("4050.00"));
            exp3.setPaidBy(manoj.getId());
            exp3.setSplitType(SplitType.EQUAL);
            exp3.setCategory("Travel");
            exp3.setCreatedBy(manoj.getId());
            exp3.setParticipants(Arrays.asList(
                    new ExpenseSplit(manoj.getId(), new BigDecimal("1350.00"), 33.33),
                    new ExpenseSplit(rahul.getId(), new BigDecimal("1350.00"), 33.33),
                    new ExpenseSplit(aman.getId(), new BigDecimal("1350.00"), 33.33)
            ));
            expenseRepository.save(exp3);

            System.out.println("Data initialization complete!");
        }
    }
}
