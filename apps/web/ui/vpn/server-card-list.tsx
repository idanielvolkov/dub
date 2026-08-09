import { CardList, CardListCard } from "@dub/ui";

/**
 * Compatibility exports for the VPN and business pages. Both components are
 * the original Dub CardList primitives; keeping the existing names lets every
 * migrated screen share Dub's interaction and layout behavior.
 */
export const DubCardList = CardList;
export const DubCard = CardListCard;
